import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { requireEnv } from '../../config/env';

@Module({
  imports: [
    JwtModule.register({
      secret: requireEnv('JWT_SECRET'),
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
