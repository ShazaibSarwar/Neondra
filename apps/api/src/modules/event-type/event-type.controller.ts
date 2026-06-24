import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventTypeService } from './event-type.service';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Event Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('event-types')
export class EventTypeController {
  constructor(private readonly eventTypeService: EventTypeService) {}

  @Get()
  @ApiOperation({ summary: 'List all event types' })
  list() {
    return this.eventTypeService.list();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new event type' })
  create(@Body() dto: CreateEventTypeDto) {
    return this.eventTypeService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an event type' })
  update(@Param('id') id: string, @Body() dto: CreateEventTypeDto) {
    return this.eventTypeService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event type' })
  delete(@Param('id') id: string) {
    return this.eventTypeService.delete(id);
  }
}
