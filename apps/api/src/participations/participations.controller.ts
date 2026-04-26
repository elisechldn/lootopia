import { Body, Controller, Get, Param, Post, Query, HttpCode } from '@nestjs/common';
import { ParticipationsService } from './participations.service';
import { StartHuntDto } from './dto/start-hunt.dto';
import { ValidateStepDto } from './dto/validate-step.dto';

@Controller('participations')
export class ParticipationsController {
    constructor(private readonly participationsService: ParticipationsService) {}

    // POST /participations — démarre une chasse pour un joueur
    @Post()
    @HttpCode(201)
    startHunt(@Body() dto: StartHuntDto) {
        return this.participationsService.startHunt(dto);
    }

    // GET /participations/me?userId= — historique d'un joueur
    @Get('me')
    findByUser(@Query('userId') userId: string) {
        return this.participationsService.findByUser(Number(userId));
    }

    // GET /participations/partner?partnerId= — joueurs des chasses d'un partenaire
    @Get('partner')
    findByPartner(@Query('partnerId') partnerId?: string) {
        const id = partnerId ? Number(partnerId) : null;
        return this.participationsService.findByPartner(id);
    }

    // GET /participations/:id — détail d'une participation
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.participationsService.findOne(Number(id));
    }

    // POST /participations/:id/steps/:stepId/validate — valide l'étape courante
    @Post(':id/steps/:stepId/validate')
    validateStep(
        @Param('id') id: string,
        @Param('stepId') stepId: string,
        @Body() dto: ValidateStepDto,
    ) {
        return this.participationsService.validateStep(Number(id), Number(stepId), dto);
    }

    // POST /participations/:id/steps/:stepId/clues/:clueId/use — utilise un indice
    @Post(':id/steps/:stepId/clues/:clueId/use')
    requestClue(
        @Param('id') id: string,
        @Param('stepId') stepId: string,
        @Param('clueId') clueId: string,
        @Body('userId') userId: number,
    ) {
        return this.participationsService.requestClue(
            Number(id),
            Number(stepId),
            Number(clueId),
            Number(userId),
        );
    }

    // GET /participations/hunt/:huntId/leaderboard — classement d'une chasse
    @Get('hunt/:huntId/leaderboard')
    leaderboard(@Param('huntId') huntId: string) {
        return this.participationsService.leaderboard(Number(huntId));
    }
}
