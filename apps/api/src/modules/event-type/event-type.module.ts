import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { EventType } from '../../database/models';
import { EventTypeController } from './event-type.controller';
import { EventTypeService } from './event-type.service';

@Module({
  imports: [SequelizeModule.forFeature([EventType])],
  controllers: [EventTypeController],
  providers: [EventTypeService],
  exports: [EventTypeService],
})
export class EventTypeModule {}
