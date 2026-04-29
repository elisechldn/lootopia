import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '@repo/types';
import { requireEnv } from '../../config/env';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly prisma: PrismaClient;

  constructor() {
    const adapter = new PrismaPg({
      connectionString: requireEnv('DATABASE_URL'),
    });
    this.prisma = new PrismaClient({ adapter });
  }

  get user() {
    return this.prisma.user;
  }

  get hunt() {
    return this.prisma.hunt;
  }

  get step() {
    return this.prisma.step;
  }

  get participation() {
    return this.prisma.participation;
  }

  get progress() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.prisma.progress;
  }

  get clue() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.prisma.clue;
  }

  get clueUsage() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.prisma.clueUsage;
  }

  get arItem() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.prisma.arItem;
  }

  $queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: unknown[]
  ): Promise<T> {
    return this.prisma.$queryRaw<T>(query as Prisma.Sql, ...values);
  }

  get $executeRaw() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.prisma.$executeRaw.bind(this.prisma);
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }
  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
