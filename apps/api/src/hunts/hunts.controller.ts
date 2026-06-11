import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HuntsService } from './hunts.service';
import { CreateHuntDto } from './dto/create-hunt.dto';

@Controller('hunts')
export class HuntsController {
  constructor(private readonly huntsService: HuntsService) {}

  private async assertOwnership(
    huntId: number,
    requester: { sub: number; role: string },
  ) {
    if (requester.role === 'ADMIN') return;
    const hunt = (await this.huntsService.findOne(huntId)) as {
      refUser: number;
    } | null;
    if (!hunt || hunt.refUser !== requester.sub) {
      throw new ForbiddenException('Vous ne gérez pas cette chasse');
    }
  }

  /** PARTNER → limité à son propre périmètre ; ADMIN → userId ciblé ou global (null). */
  private resolvePartnerScope(
    user: { sub: number; role: string },
    queryUserId?: string,
  ): number | null {
    if (user.role === 'ADMIN') {
      return queryUserId ? Number(queryUserId) : null;
    }
    return user.sub;
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(
    @Request() req: { user: { sub: number; role: string } },
    @Query('userId') userId?: string,
  ) {
    return this.huntsService.findByPartner(
      this.resolvePartnerScope(req.user, userId),
    );
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  stats(
    @Request() req: { user: { sub: number; role: string } },
    @Query('userId') userId?: string,
  ) {
    return this.huntsService.stats(this.resolvePartnerScope(req.user, userId));
  }

  @Get('nearby')
  findNearby(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('radius') radius?: string,
  ) {
    return this.huntsService.findNearby(
      Number(lat),
      Number(lon),
      radius ? Number(radius) : undefined,
    );
  }

  @Get('analytics')
  @UseGuards(AuthGuard('jwt'))
  analytics(
    @Request() req: { user: { sub: number; role: string } },
    @Query('userId') userId?: string,
  ) {
    return this.huntsService.analytics(
      this.resolvePartnerScope(req.user, userId),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.huntsService.findOne(Number(id));
  }

  @Post()
  @HttpCode(201)
  @UseGuards(AuthGuard('jwt'))
  create(
    @Request() req: { user: { sub: number } },
    @Body() dto: CreateHuntDto,
  ) {
    return this.huntsService.create({ ...dto, refUser: req.user.sub });
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Request() req: { user: { sub: number; role: string } },
    @Param('id') id: string,
    @Body() dto: Partial<CreateHuntDto>,
  ) {
    await this.assertOwnership(Number(id), req.user);
    return this.huntsService.update(Number(id), dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard('jwt'))
  async remove(
    @Request() req: { user: { sub: number; role: string } },
    @Param('id') id: string,
  ) {
    await this.assertOwnership(Number(id), req.user);
    return this.huntsService.remove(Number(id));
  }

  @Post(':id/steps')
  @UseGuards(AuthGuard('jwt'))
  async upsertSteps(
    @Request() req: { user: { sub: number; role: string } },
    @Param('id') id: string,
    @Body() body: { steps: Array<Record<string, unknown>> },
  ): Promise<unknown> {
    await this.assertOwnership(Number(id), req.user);
    return this.huntsService.upsertSteps(Number(id), body.steps);
  }
}
