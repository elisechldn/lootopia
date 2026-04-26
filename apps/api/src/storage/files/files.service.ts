import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { StorageService } from '../storage.service';

export type FileKind = 'cover' | 'ar-model' | 'ar-marker';

type Rules = {
  mimeTypes: string[];
  maxBytes: number;
  extension: (mime: string) => string;
};

const FIVE_MB = 5 * 1024 * 1024;
const TEN_MB = 10 * 1024 * 1024;

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const RULES: Record<FileKind, Rules> = {
  cover: {
    mimeTypes: Object.keys(IMAGE_MIME_TO_EXT),
    maxBytes: FIVE_MB,
    extension: (mime) => IMAGE_MIME_TO_EXT[mime] ?? 'bin',
  },
  'ar-marker': {
    mimeTypes: Object.keys(IMAGE_MIME_TO_EXT),
    maxBytes: FIVE_MB,
    extension: (mime) => IMAGE_MIME_TO_EXT[mime] ?? 'bin',
  },
  'ar-model': {
    mimeTypes: ['model/gltf-binary', 'application/octet-stream'],
    maxBytes: TEN_MB,
    extension: () => 'glb',
  },
};

@Injectable()
export class FilesService {
  constructor(private readonly storage: StorageService) {}

  async upload(
    userId: number,
    kind: FileKind,
    file: Express.Multer.File,
  ): Promise<{ key: string; url: string }> {
    const rules = RULES[kind];
    if (!rules) {
      throw new BadRequestException(`Type de fichier inconnu : ${kind}`);
    }
    if (!file?.buffer) {
      throw new BadRequestException('Fichier manquant');
    }
    if (!rules.mimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Type MIME refusé pour "${kind}" : ${file.mimetype}`,
      );
    }
    if (file.size > rules.maxBytes) {
      throw new BadRequestException(
        `Fichier trop volumineux (max ${rules.maxBytes / 1024 / 1024} Mo)`,
      );
    }
    if (kind === 'ar-model' && !this.hasGlbMagicBytes(file.buffer)) {
      throw new BadRequestException(
        'Fichier .glb invalide (magic bytes "glTF" manquants)',
      );
    }

    const ext = rules.extension(file.mimetype);
    const key = `partners/${userId}/${kind}s/${randomUUID()}.${ext}`;
    await this.storage.uploadObject(key, file.buffer, file.mimetype);

    return { key, url: this.storage.toPublicUrl(key) };
  }

  private hasGlbMagicBytes(buffer: Buffer): boolean {
    return (
      buffer.length >= 4 &&
      buffer[0] === 0x67 && // g
      buffer[1] === 0x6c && // l
      buffer[2] === 0x54 && // T
      buffer[3] === 0x46 //   F
    );
  }
}
