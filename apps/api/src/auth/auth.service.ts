import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../orm/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { logInfo } from '../loggeur';
import { MailService } from '../mail/mail.service';

type UserWithParticipations = {
  id: number;
  email: string;
  role: string;
  firstname: string;
  lastname: string;
  participations?: {
    id: number;
    status: string;
    startTime: Date;
    endTime: Date | null;
    totalPoints: number;
    hunt: { id: number; title: string };
    progresses: {
      id: number;
      statut: string;
      totalPoints: number;
      startedAt: Date;
      completedAt: Date | null;
      step: {
        id: number;
        orderNumber: number;
        title: string;
        points: number;
      };
    }[];
  }[];
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  async register(dto: {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    country: string;
    role?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      logInfo(
        'error',
        `Tentative d'inscription avec un email déjà utilisé: ${dto.email} (un qui a oublie sont mdp :) )`,
        'AuthService',
      );
      throw new ConflictException('Email déjà utilisé');
    }

    const hash = await bcrypt.hash(dto.password, 10);
    // logInfo('warn', `leak de mot de passe: ${dto.password}`, 'AuthService'); a ne jamais active
    // sauf si on veux la mettre a l'envers SDV :)

    const { password: _pw, ...rest } = dto;
    const user = await this.prisma.user.create({
      data: {
        ...rest,
        passwordHash: hash,
        role: (dto.role === 'PLAYER' ? 'PLAYER' : 'PARTNER') as never,
      },
    });
    logInfo(
      'info',
      `Nouvel utilisateur enregistré: ${user.email} (ID: ${user.id})`,
      'AuthService',
    );

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
    });

    const appUrl =
      dto.role === 'PLAYER'
        ? (process.env.APP_URL_PWA ?? 'https://localhost:3001')
        : (process.env.APP_URL_WEB ?? 'https://localhost:3000');

    this.mail
      .sendEmailVerification(
        { email: user.email, firstname: user.firstname },
        verificationToken,
        appUrl,
      )
      .catch(() => {
        logInfo(
          'error',
          `Échec envoi email de vérification pour: ${user.email}`,
          'AuthService',
        );
      });

    return { message: 'Vérifiez votre email pour activer votre compte.' };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        participations: {
          include: {
            hunt: { select: { id: true, title: true } },
            progresses: {
              include: {
                step: {
                  select: {
                    id: true,
                    orderNumber: true,
                    title: true,
                    points: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!user) {
      logInfo(
        'error',
        `Tentative de connexion avec un email non reconnu: ${email} (raté mon coco)`,
        'AuthService',
      );

      throw new UnauthorizedException('Identifiants invalides');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      logInfo(
        'error',
        `Tentative de connexion avec un mot de passe incorrect pour l'email: ${email} (encore raté)`,
        'AuthService',
      );
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (!user.emailVerified) {
      logInfo(
        'warn',
        `Tentative de connexion avec email non vérifié: ${email}`,
        'AuthService',
      );
      throw new UnauthorizedException(
        'Veuillez confirmer votre email avant de vous connecter.',
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastConnection: new Date() },
    });

    logInfo(
      'info',
      `Utilisateur connecté: ${user.email} (ID: ${user.id})`,
      'AuthService',
    );
    return this.signToken(user);
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Lien de vérification invalide ou expiré.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    logInfo(
      'info',
      `Email vérifié pour: ${user.email} (ID: ${user.id})`,
      'AuthService',
    );
    return this.signToken(user);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Anti-enumeration : même réponse que si l'utilisateur existe
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    logInfo(
      'info',
      `Token de réinitialisation généré pour: ${user.email}`,
      'AuthService',
    );

    const appUrl =
      user.role === 'PLAYER'
        ? (process.env.APP_URL_PWA ?? 'https://localhost:3001')
        : (process.env.APP_URL_WEB ?? 'https://localhost:3000');

    this.mail
      .sendPasswordReset(
        { email: user.email, firstname: user.firstname },
        token,
        appUrl,
      )
      .catch(() => {
        logInfo(
          'error',
          `Échec envoi email de réinitialisation pour: ${user.email}`,
          'AuthService',
        );
      });
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hash,
        resetToken: null,
        resetTokenExpiry: null,
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    logInfo(
      'info',
      `Mot de passe réinitialisé pour: ${user.email} (ID: ${user.id})`,
      'AuthService',
    );
  }

  private signToken(user: UserWithParticipations) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    logInfo(
      'info',
      `Token généré pour l'utilisateur: ${user.email} (ID: ${user.id})`,
      'AuthService',
    );
    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
        participations: user.participations ?? [],
      },
    };
  }
}
