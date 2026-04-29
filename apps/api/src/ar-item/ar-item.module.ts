import { Module } from '@nestjs/common';
import { ArItemController } from './ar-item.controller';
import { ArItemService } from './ar-item.service';

@Module({
  controllers: [ArItemController],
  providers: [ArItemService],
})
export class ArItemModule {}
