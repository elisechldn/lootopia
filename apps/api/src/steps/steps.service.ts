import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../orm/prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import type { UploadMarkerResponseDto } from './dto/upload-marker-response.dto';

const TEN_MB = 10 * 1024 * 1024;
const ONE_MB = 1024 * 1024;

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class StepsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // NON UTILISE ACTUELLEMENT — ancienne version générant le .patt côté serveur à partir de l'image
  // async uploadMarker(
  //   stepId: number,
  //   userId: number,
  //   file: Express.Multer.File,
  // ): Promise<UploadMarkerResponseDto> {
  //   this.validateImageFile(file);
  //
  //   const step = await this.prisma.step.findUnique({
  //     where: { id: stepId },
  //     include: { hunt: true },
  //   });
  //   if (!step) {
  //     throw new NotFoundException('Étape introuvable');
  //   }
  //   if (step.hunt.refUser !== userId) {
  //     throw new ForbiddenException();
  //   }
  //
  //   const ext = IMAGE_MIME_TO_EXT[file.mimetype] ?? 'bin';
  //   const uuid = randomUUID();
  //   const imageKey = `partners/${userId}/ar-markers/${stepId}/${uuid}.${ext}`;
  //   const pattKey = `partners/${userId}/ar-markers/${stepId}/${uuid}.patt`;
  //
  //   await this.storage.uploadObject(imageKey, file.buffer, file.mimetype);
  //
  //   let pattBuffer: Buffer;
  //   try {
  //     pattBuffer = await this.generatePattBuffer(file.buffer);
  //   } catch {
  //     await this.storage.deleteObject(imageKey).catch(() => {});
  //     throw new BadRequestException(
  //       "Impossible de traiter l'image pour générer le fichier .patt",
  //     );
  //   }
  //
  //   await this.storage.uploadObject(pattKey, pattBuffer, 'text/plain');
  //
  //   const markerImageUrl = imageKey;
  //   const markerPatternUrl = pattKey;
  //
  //   await this.prisma.step.update({
  //     where: { id: stepId },
  //     data: { markerImageUrl, markerPatternUrl },
  //   });
  //
  //   return { markerImageUrl, markerPatternUrl };
  // }

  async uploadMarkerFiles(
    stepId: number,
    userId: number,
    imageFile: Express.Multer.File | undefined,
    patternFile: Express.Multer.File | undefined,
  ): Promise<UploadMarkerResponseDto> {
    if (!imageFile && !patternFile) {
      throw new BadRequestException('Au moins un fichier (image ou .patt) est requis');
    }

    if (imageFile) this.validateImageFile(imageFile);
    if (patternFile) this.validatePatternFile(patternFile);

    const step = await this.prisma.step.findUnique({
      where: { id: stepId },
      include: { hunt: true },
    });
    if (!step) {
      throw new NotFoundException('Étape introuvable');
    }
    if (step.hunt.refUser !== userId) {
      throw new ForbiddenException();
    }

    if (imageFile && step.markerImageUrl) {
      await this.storage.deleteObject(step.markerImageUrl).catch(() => {});
    }
    if (patternFile && step.markerPatternUrl) {
      await this.storage.deleteObject(step.markerPatternUrl).catch(() => {});
    }

    const uuid = randomUUID();
    let markerImageUrl = step.markerImageUrl ?? undefined;
    let markerPatternUrl = step.markerPatternUrl ?? undefined;

    if (imageFile) {
      const ext = IMAGE_MIME_TO_EXT[imageFile.mimetype] ?? 'bin';
      const imageKey = `partners/${userId}/ar-markers/${stepId}/${uuid}.${ext}`;
      await this.storage.uploadObject(imageKey, imageFile.buffer, imageFile.mimetype);
      markerImageUrl = imageKey;
    }

    if (patternFile) {
      const pattKey = `partners/${userId}/ar-markers/${stepId}/${uuid}.patt`;
      await this.storage.uploadObject(pattKey, patternFile.buffer, 'text/plain');
      markerPatternUrl = pattKey;
    }

    await this.prisma.step.update({
      where: { id: stepId },
      data: {
        ...(markerImageUrl !== undefined && { markerImageUrl }),
        ...(markerPatternUrl !== undefined && { markerPatternUrl }),
      },
    });

    return {
      markerImageUrl: markerImageUrl ?? '',
      markerPatternUrl: markerPatternUrl ?? '',
    };
  }

  private validateImageFile(file: Express.Multer.File): void {
    if (!file?.buffer) {
      throw new BadRequestException('Fichier image manquant');
    }
    if (!Object.keys(IMAGE_MIME_TO_EXT).includes(file.mimetype)) {
      throw new BadRequestException(
        `Type de fichier refusé : ${file.mimetype}. Seuls PNG, JPEG et WebP sont acceptés.`,
      );
    }
    if (file.size > TEN_MB) {
      throw new BadRequestException('Image trop volumineuse (max 10 Mo)');
    }
  }

  private validatePatternFile(file: Express.Multer.File): void {
    if (!file?.buffer) {
      throw new BadRequestException('Fichier .patt manquant');
    }
    if (!file.originalname.endsWith('.patt')) {
      throw new BadRequestException('Le fichier pattern doit avoir l\'extension .patt');
    }
    if (file.size > ONE_MB) {
      throw new BadRequestException('Fichier .patt trop volumineux (max 1 Mo)');
    }
  }

  // NON UTILISE ACTUELLEMENT — génération du .patt côté serveur (remplacé par upload direct)
  // private async generatePattBuffer(imageBuffer: Buffer): Promise<Buffer> {
  //   const raw = await sharp(imageBuffer)
  //     .resize(16, 16)
  //     .grayscale()
  //     .raw()
  //     .toBuffer();
  //
  //   const grid: number[][] = [];
  //   for (let row = 0; row < 16; row++) {
  //     grid.push(Array.from(raw.subarray(row * 16, (row + 1) * 16)));
  //   }
  //
  //   const rotations: number[][][] = [grid];
  //   for (let r = 0; r < 3; r++) {
  //     const prev = rotations[rotations.length - 1]!;
  //     const rotated: number[][] = [];
  //     for (let i = 0; i < 16; i++) {
  //       rotated.push(prev.map((row) => row[i]!).reverse());
  //     }
  //     rotations.push(rotated);
  //   }
  //
  //   const lines: string[] = [];
  //   for (let r = 0; r < 4; r++) {
  //     if (r > 0) lines.push('');
  //     for (const row of rotations[r]!) {
  //       lines.push(row.join(' '));
  //     }
  //   }
  //
  //   return Buffer.from(lines.join('\n') + '\n');
  // }
}
