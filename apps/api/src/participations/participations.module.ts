import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ParticipationsController } from './participations.controller';
import { ParticipationsService } from './participations.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [PassportModule, AuthModule],
    controllers: [ParticipationsController],
    providers: [ParticipationsService],
})
export class ParticipationsModule {}
