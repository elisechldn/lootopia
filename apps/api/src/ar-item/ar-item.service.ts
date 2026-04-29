import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Prisma } from '@repo/types';
import type { ArItemModel } from '@repo/types';
import { PrismaService } from '../orm/prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

const TEN_MB = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'model/gltf-binary',
  'application/octet-stream',
];

@Injectable()
export class ArItemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async upload(userId: number, file: Express.Multer.File) {
    this.validateFile(file);

    const uuid = randomUUID();
    const filepath = `ar-items/${uuid}/${file.originalname}`;

    await this.storage.uploadObject(filepath, file.buffer, file.mimetype);

    try {
      const arItem = await this.prisma.arItem.create({
        data: {
          filename: file.originalname,
          filepath,
          hasAnimations: false,
        },
      });
      return arItem;
    } catch (err) {
      await this.storage.deleteObject(filepath).catch(() => {});
      throw err;
    }
  }

  async findByPartner(userId: number, role: string): Promise<ArItemModel[]> {
    if (role === 'ADMIN') {
      return this.prisma.arItem.findMany({ orderBy: { createdAt: 'desc' } });
    }
    return this.prisma.$queryRaw<ArItemModel[]>(Prisma.sql`
      SELECT DISTINCT ai.*
      FROM "ArItem" ai
      INNER JOIN "Step" s ON s."refArItem" = ai.id
      INNER JOIN "Hunt" h ON s."refHunt" = h.id
      WHERE h."refUser" = ${userId}
      ORDER BY ai."createdAt" DESC
    `);
  }

  async getUsage(
    id: string,
  ): Promise<{ stepsCount: number; huntsCount: number }> {
    const result = await this.prisma.$queryRaw<
      [{ steps_count: bigint; hunts_count: bigint }]
    >(
      Prisma.sql`
        SELECT
          COUNT(DISTINCT s.id) AS steps_count,
          COUNT(DISTINCT h.id) AS hunts_count
        FROM "Step" s
        INNER JOIN "Hunt" h ON s."refHunt" = h.id
        WHERE s."refArItem" = ${id}
      `,
    );
    return {
      stepsCount: Number(result[0].steps_count),
      huntsCount: Number(result[0].hunts_count),
    };
  }

  async remove(id: string) {
    const usage = await this.getUsage(id);
    if (usage.stepsCount > 0) {
      throw new ConflictException({
        message: `Cet ArItem est utilisé dans ${usage.stepsCount} étape(s)`,
        stepsCount: usage.stepsCount,
        huntsCount: usage.huntsCount,
      });
    }
    const arItem = await this.prisma.arItem.findUniqueOrThrow({
      where: { id },
    });
    await this.prisma.arItem.delete({ where: { id } });
    await this.storage.deleteObject(arItem.filepath).catch(() => {});
  }

  private validateFile(file: Express.Multer.File) {
    if (!file?.buffer) {
      throw new BadRequestException('Fichier manquant');
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Type MIME refusé : ${file.mimetype}`);
    }
    if (file.size > TEN_MB) {
      throw new BadRequestException('Fichier trop volumineux (max 10 Mo)');
    }
    if (
      (file.mimetype === 'model/gltf-binary' ||
        file.mimetype === 'application/octet-stream') &&
      !this.hasGlbMagicBytes(file.buffer)
    ) {
      throw new BadRequestException(
        'Fichier .glb invalide (magic bytes "glTF" manquants)',
      );
    }
  }

  private hasGlbMagicBytes(buffer: Buffer): boolean {
    return (
      buffer.length >= 4 &&
      buffer[0] === 0x67 &&
      buffer[1] === 0x6c &&
      buffer[2] === 0x54 &&
      buffer[3] === 0x46
    );
  }
}
