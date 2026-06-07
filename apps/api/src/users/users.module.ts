import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { FilesModule } from '../storage/files/files.module';

@Module({
  imports: [PassportModule, AuthModule, FilesModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
