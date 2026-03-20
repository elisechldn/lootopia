import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './orm/prisma/prisma.module';
import { PrismaService } from './orm/prisma/prisma.service';
import { UsersModule } from './users/users.module';
import {HuntsModule} from "./hunts/hunts.module";
import {AuthModule} from "./auth/auth.module";
import { StatsController } from './stats/stats.controller';

@Module({
  imports: [ConfigModule.forRoot(), UsersModule, PrismaModule, HuntsModule, AuthModule],
  controllers: [StatsController],
  providers: [PrismaService],
})

export class AppModule {}
