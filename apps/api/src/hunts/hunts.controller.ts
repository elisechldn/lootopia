import { Body, Controller, Delete, Get, Param, Post, Put, Query, HttpCode } from '@nestjs/common';
import { HuntsService } from './hunts.service';
import { CreateHuntDto } from './dto/create-hunt.dto';

@Controller('hunts')
export class HuntsController {
    constructor(private readonly huntsService: HuntsService) {}

    @Get()
    findAll(@Query('userId') userId?: string) {
        const id = userId ? Number(userId) : null;
        return this.huntsService.findByPartner(id);
    }

    @Get('stats')
    stats(@Query('userId') userId?: string) {
        const id = userId ? Number(userId) : null;
        return this.huntsService.stats(id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.huntsService.findOne(Number(id));
    }

    @Post()
    @HttpCode(201)
    create(@Body() dto: CreateHuntDto) {
        return this.huntsService.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: Partial<CreateHuntDto>) {
        return this.huntsService.update(Number(id), dto);
    }

    @Delete(':id')
    @HttpCode(204)
    remove(@Param('id') id: string) {
        return this.huntsService.remove(Number(id));
    }

    @Post(':id/steps')
    createSteps(
        @Param('id') id: string,
        @Body() body: { steps: Array<Record<string, unknown>> }
    ) {
        return this.huntsService.createSteps(Number(id), body.steps);
    }
}