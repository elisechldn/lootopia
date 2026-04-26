import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../orm/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { logInfo } from '../loggeur';

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
        actionType: string;
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
        logInfo('error', `Tentative d'inscription avec un email déjà utilisé: ${dto.email} (un qui a oublie sont mdp :) )`, 'AuthService');
        throw new ConflictException('Email déjà utilisé')
    };

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
        logInfo('info', `Nouvel utilisateur enregistré: ${user.email} (ID: ${user.id})`, 'AuthService');
    return this.signToken(user);
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
                    actionType: true,
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
        logInfo('error', `Tentative de connexion avec un email non reconnu: ${email} (raté mon coco)`, 'AuthService');
        
        throw new UnauthorizedException('Identifiants invalides')
    };

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        logInfo('error', `Tentative de connexion avec un mot de passe incorrect pour l'email: ${email} (encore raté)`, 'AuthService');
        throw new UnauthorizedException('Identifiants invalides');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastConnection: new Date() },
    });

    logInfo('info', `Utilisateur connecté: ${user.email} (ID: ${user.id})`, 'AuthService');
    return this.signToken(user);
  }

  private signToken(user: UserWithParticipations) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    
    logInfo('info', `Token généré pour l'utilisateur: ${user.email} (ID: ${user.id})`, 'AuthService');
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
