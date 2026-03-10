import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './orm/prisma/prisma.module';
import { PrismaService } from './orm/prisma/prisma.service';
import { UsersModule } from './users/users.module';
@Module({
  imports: [ConfigModule.forRoot(), UsersModule, PrismaModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
