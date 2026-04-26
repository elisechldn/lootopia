import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import { memoryStorage } from 'multer';
import { FileKind, FilesService } from './files.service';

const ALLOWED_KINDS: FileKind[] = ['cover', 'ar-model', 'ar-marker'];
const TEN_MB = 10 * 1024 * 1024;

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: TEN_MB },
    }),
  )
  async upload(
    @Headers('authorization') authorization: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('kind') kind: string,
  ) {
    console.log('UPLOAD');
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant ou invalide');
    }
    let payload: { sub: number };
    try {
      console.log(2);
      console.log(authorization)
      const lol: { sub: number } = this.jwtService.verify(
        authorization.slice(7),
      );
      console.log(lol);
      payload = this.jwtService.verify(authorization.slice(7));
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
    if (!ALLOWED_KINDS.includes(kind as FileKind)) {
      throw new BadRequestException(`Champ "kind" requis (${ALLOWED_KINDS.join(', ')})`);
    }
    return this.filesService.upload(payload.sub, kind as FileKind, file);
  }
}
