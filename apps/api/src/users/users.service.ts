import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, PaginatedResult, UpdateUserDto } from '@repo/types';
import { PrismaService } from '../orm/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    const data = {
      ...createUserDto,
      lastConnection: null,
    };
    return this.prisma.user.create({ data });
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
}
