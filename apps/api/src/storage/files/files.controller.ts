import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import { memoryStorage } from 'multer';
import { FileKind, FilesService } from './files.service';
import { AuthGuard } from "@nestjs/passport";

const ALLOWED_KINDS: FileKind[] = ['cover', 'ar-model', 'ar-marker'];
const TEN_MB = 10 * 1024 * 1024;

@UseGuards(AuthGuard('jwt'))
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
    let payload: { sub: number };
    try {
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
