import {
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StartHuntDto } from './dto/start-hunt.dto';
import { ValidateStepDto } from './dto/validate-step.dto';
import { ParticipationsService } from './participations.service';

@UseGuards(AuthGuard('jwt'))
@Controller('participations')
export class ParticipationsController {
  constructor(private readonly participationsService: ParticipationsService) {}

  @Post()
  @HttpCode(201)
  startHunt(
    @Request() req: { user: { sub: number } },
    @Body() dto: StartHuntDto,
  ) {
    return this.participationsService.startHunt(dto, req.user.sub);
  }

  @Get('me')
  findByUser(@Request() req: { user: { sub: number } }) {
    return this.participationsService.findByUser(req.user.sub);
  }

  @Get('partner')
  findByPartner(@Request() req: { user: { sub: number } }) {
    return this.participationsService.findByPartner(req.user.sub);
  }

  @Get('player/:userId')
  findByPlayer(@Param('userId') userId: string) {
    return this.participationsService.findByPlayer(Number(userId));
  }

  @Get('hunt/:huntId/leaderboard')
  leaderboard(@Param('huntId') huntId: string) {
    return this.participationsService.leaderboard(Number(huntId));
  }

  @Get(':id')
  findOne(@Request() req: { user: { sub: number } }, @Param('id') id: string) {
    return this.participationsService.findOne(Number(id), req.user.sub);
  }

  @Post(':id/steps/:stepId/validate')
  validateStep(
    @Request() req: { user: { sub: number } },
    @Param('id') id: string,
    @Param('stepId') stepId: string,
    @Body() dto: ValidateStepDto,
  ) {
    return this.participationsService.validateStep(
      Number(id),
      Number(stepId),
      req.user.sub,
      dto,
    );
  }

  @Post(':id/steps/:stepId/clues/:clueId/use')
  requestClue(
    @Request() req: { user: { sub: number } },
    @Param('id') id: string,
    @Param('stepId') stepId: string,
    @Param('clueId') clueId: string,
  ) {
    return this.participationsService.requestClue(
      Number(id),
      Number(stepId),
      Number(clueId),
      req.user.sub,
    );
  }
}
