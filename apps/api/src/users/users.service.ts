import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  CreateUserDto,
  PaginatedResult,
  Prisma,
  UpdateUserDto,
} from '@repo/types';
import { PrismaService } from '../orm/prisma/prisma.service';

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
                  actionType: true;
                  points: true;
                };
              };
            };
          };
        };
      };
    };
  }>,
  'passwordHash'
>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;
    const passwordHash = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { ...rest, passwordHash, lastConnection: null },
    });
  }

  async findAll(page = 1, pageSize = 10): Promise<PaginatedResult<unknown>> {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({ skip, take: pageSize }),
      this.prisma.user.count(),
    ]);
    return { data, total, page, pageSize };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch {
      throw new NotFoundException(`User #${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch {
      throw new NotFoundException(`User #${id} not found`);
    }
  }

  async findMe(userId: number): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      omit: {
        passwordHash: true,
      },
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

    if (!user) throw new NotFoundException(`User #${userId} not found`);
    return user;
  }
}
