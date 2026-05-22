import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CluesService } from './clues.service';
import { CreateClueDto } from './dto/create-clue.dto';
import { UpdateClueDto } from './dto/update-clue.dto';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class CluesController {
  constructor(private readonly cluesService: CluesService) {}

  // ── CRUD (partenaire / admin) ────────────────────────────────────────────

  @Post('steps/:stepId/clues')
  create(
    @Request() req: { user: { sub: number; role: string } },
    @Param('stepId') stepId: string,
    @Body() dto: CreateClueDto,
  ) {
    return this.cluesService.create(
      Number(stepId),
      req.user.sub,
      req.user.role,
      dto,
    );
  }

  @Get('steps/:stepId/clues')
  findByStep(@Param('stepId') stepId: string) {
    return this.cluesService.findByStep(Number(stepId));
  }

  @Patch('clues/:clueId')
  update(
    @Request() req: { user: { sub: number; role: string } },
    @Param('clueId') clueId: string,
    @Body() dto: UpdateClueDto,
  ) {
    return this.cluesService.update(
      Number(clueId),
      req.user.sub,
      req.user.role,
      dto,
    );
  }

  @Delete('clues/:clueId')
  @HttpCode(204)
  remove(
    @Request() req: { user: { sub: number; role: string } },
    @Param('clueId') clueId: string,
  ) {
    return this.cluesService.remove(
      Number(clueId),
      req.user.sub,
      req.user.role,
    );
  }

  // ── Reveal (joueur) ──────────────────────────────────────────────────────

  @Get('progress/:progressId/clues')
  getPlayerClues(
    @Request() req: { user: { sub: number } },
    @Param('progressId') progressId: string,
  ) {
    return this.cluesService.getPlayerClues(Number(progressId), req.user.sub);
  }

  @Post('progress/:progressId/clues/:clueId/reveal')
  revealClue(
    @Request() req: { user: { sub: number } },
    @Param('progressId') progressId: string,
    @Param('clueId') clueId: string,
  ) {
    return this.cluesService.revealClue(
      Number(progressId),
      Number(clueId),
      req.user.sub,
    );
  }
}
