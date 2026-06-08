import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { HuntsController } from './hunts.controller';
import { HuntsService } from './hunts.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PassportModule, AuthModule],
  controllers: [HuntsController],
  providers: [HuntsService],
})
export class HuntsModule {}
