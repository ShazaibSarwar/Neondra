import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/models';
import { WeddingService } from './wedding.service';
import { CreateWeddingDto } from './dto/create-wedding.dto';
import { UpdateWeddingDto } from './dto/update-wedding.dto';
import { CreateCeremonyEventDto } from './dto/create-ceremony-event.dto';
import { UpdateCeremonyEventDto } from './dto/update-ceremony-event.dto';

@ApiTags('Weddings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('families/:id/weddings')
export class WeddingController {
  constructor(private readonly weddingService: WeddingService) {}

  @Get()
  @ApiOperation({ summary: "List family's weddings" })
  async list(@Param('id') familyId: string) {
    return this.weddingService.list(familyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create wedding' })
  async create(
    @Param('id') familyId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateWeddingDto,
  ) {
    return this.weddingService.create(familyId, user.id, dto);
  }

  @Get(':wId')
  @ApiOperation({ summary: 'Get wedding detail with events' })
  async getOne(@Param('wId') weddingId: string) {
    return this.weddingService.getOne(weddingId);
  }

  @Put(':wId')
  @ApiOperation({ summary: 'Update wedding' })
  async update(@Param('wId') weddingId: string, @Body() dto: UpdateWeddingDto) {
    return this.weddingService.update(weddingId, dto);
  }

  @Post(':wId/events')
  @ApiOperation({ summary: 'Add ceremony event' })
  async createEvent(@Param('wId') weddingId: string, @Body() dto: CreateCeremonyEventDto) {
    return this.weddingService.createEvent(weddingId, dto);
  }

  @Put(':wId/events/:eId')
  @ApiOperation({ summary: 'Update ceremony event' })
  async updateEvent(@Param('eId') eventId: string, @Body() dto: UpdateCeremonyEventDto) {
    return this.weddingService.updateEvent(eventId, dto);
  }

  @Delete(':wId')
  @ApiOperation({ summary: 'Delete wedding' })
  async delete(@Param('wId') weddingId: string) {
    return this.weddingService.delete(weddingId);
  }

  @Delete(':wId/events/:eId')
  @ApiOperation({ summary: 'Delete ceremony event' })
  async deleteEvent(@Param('eId') eventId: string) {
    return this.weddingService.deleteEvent(eventId);
  }
}
