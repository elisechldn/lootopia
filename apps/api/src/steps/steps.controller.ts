import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StepsService } from './steps.service';

const TEN_MB = 10 * 1024 * 1024;

@Controller('steps')
export class StepsController {
  constructor(private readonly stepsService: StepsService) {}

  // NON UTILISE ACTUELLEMENT — ancienne version acceptant uniquement l'image (génération .patt côté serveur)
  // @Post(':id/marker')
  // @UseGuards(AuthGuard('jwt'))
  // @UseInterceptors(
  //   FileInterceptor('image', {
  //     storage: memoryStorage(),
  //     limits: { fileSize: TEN_MB },
  //   }),
  // )
  // uploadMarker(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Request() req: { user: { sub: number } },
  //   @UploadedFile() file: Express.Multer.File,
  // ) {
  //   return this.stepsService.uploadMarker(id, req.user.sub, file);
  // }

  @Post(':id/marker')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'pattern', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: TEN_MB },
      },
    ),
  )
  uploadMarkerFiles(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { sub: number } },
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; pattern?: Express.Multer.File[] },
  ) {
    return this.stepsService.uploadMarkerFiles(
      id,
      req.user.sub,
      files.image?.[0],
      files.pattern?.[0],
    );
  }
}
