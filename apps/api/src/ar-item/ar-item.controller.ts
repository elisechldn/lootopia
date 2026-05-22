import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ArItemService } from './ar-item.service';

const LIMIT_FILE_SIZE = 10 * 1024 * 1024;

@UseGuards(AuthGuard('jwt'))
@Controller('ar-items')
export class ArItemController {
  constructor(private readonly arItemService: ArItemService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: LIMIT_FILE_SIZE },
    }),
  )
  upload(
    @Request() req: { user: { sub: number; role: string } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.arItemService.upload(req.user.sub, file);
  }

  @Get()
  findAll(@Request() req: { user: { sub: number; role: string } }) {
    return this.arItemService.findByPartner(req.user.sub, req.user.role);
  }

  @Get(':id/usage')
  getUsage(@Param('id') id: string) {
    return this.arItemService.getUsage(id);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.arItemService.remove(id);
  }
}
