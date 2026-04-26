import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './orm/prisma/prisma.module';
import { PrismaService } from './orm/prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { HuntsModule } from './hunts/hunts.module';
import { AuthModule } from './auth/auth.module';
import { ParticipationsModule } from './participations/participations.module';
import { StorageModule } from './storage/storage.module';
import { FilesModule } from './storage/files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    PrismaModule,
    HuntsModule,
    AuthModule,
    ParticipationsModule,
    StorageModule,
    FilesModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
