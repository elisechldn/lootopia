import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  CreateUserDto,
  PaginatedResult,
  Prisma,
  UpdateUserDto,
} from '@repo/types';
import { PrismaService } from '../orm/prisma/prisma.service';
import { logInfo } from '../loggeur';

/** Champs sensibles à ne jamais exposer via l'API. */
export const SENSITIVE_USER_FIELDS = {
  passwordHash: true,
  resetToken: true,
  resetTokenExpiry: true,
  emailVerificationToken: true,
  emailVerificationExpiry: true,
} satisfies Prisma.UserOmit;

type UserProfile = Omit<
  Prisma.UserGetPayload<{
    include: {
      participations: {
        include: {
          hunt: { select: { id: true; title: true } };
          progresses: {
            include: {
              step: {
                select: {
                  id: true;
                  orderNumber: true;
                  title: true;
                  points: true;
                };
              };
            };
          };
        };
      };
    };
  }>,
  | 'passwordHash'
  | 'resetToken'
  | 'resetTokenExpiry'
  | 'emailVerificationToken'
  | 'emailVerificationExpiry'
>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;
    const passwordHash = await bcrypt.hash(password, 10);
    return this.prisma.user
      .create({
        data: { ...rest, passwordHash, lastConnection: null },
        omit: SENSITIVE_USER_FIELDS,
      })
      .then((user) => {
        logInfo('info', `Utilisateur ${user.id} créé`, 'UsersService');
        return user;
      });
  }

  async findAll(page = 1, pageSize = 10): Promise<PaginatedResult<unknown>> {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: pageSize,
        omit: SENSITIVE_USER_FIELDS,
      }),
      this.prisma.user.count(),
    ]);
    logInfo(
      'info',
      `Récupération de la liste des utilisateurs avec ${data.length} utilisateurs`,
      'UsersService',
    );
    return { data, total, page, pageSize };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: SENSITIVE_USER_FIELDS,
    });
    if (!user) {
      logInfo('error', `Utilisateur ${id} non trouvé`, 'UsersService');
      throw new NotFoundException(`User #${id} not found`);
    }

    logInfo('info', `Récupération de l'utilisateur ${id}`, 'UsersService');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      return await this.prisma.user
        .update({
          where: { id },
          data: updateUserDto,
          omit: SENSITIVE_USER_FIELDS,
        })
        .then((user) => {
          logInfo('info', `Utilisateur ${id} mis à jour`, 'UsersService');
          return user;
        });
    } catch {
      logInfo(
        'error',
        `Impossible de mettre à jour l'utilisateur ${id}`,
        'UsersService',
      );
      throw new NotFoundException(`User #${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.user.delete({ where: { id } }).then(() => {
        logInfo('info', `Utilisateur ${id} supprimé`, 'UsersService');
      });
    } catch {
      logInfo(
        'error',
        `Impossible de supprimer l'utilisateur ${id}`,
        'UsersService',
      );
      throw new NotFoundException(`User #${id} not found`);
    }
  }

  async findMe(userId: number): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      omit: SENSITIVE_USER_FIELDS,
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
      logInfo('error', `Utilisateur ${userId} non trouvé`, 'UsersService');
      throw new NotFoundException(`User #${userId} not found`);
    }
    logInfo(
      'info',
      `Récupération du profil de l'utilisateur ${userId}`,
      'UsersService',
    );
    return user;
  }
}
