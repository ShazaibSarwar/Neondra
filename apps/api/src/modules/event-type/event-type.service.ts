import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EventType } from '../../database/models';
import { CreateEventTypeDto } from './dto/create-event-type.dto';

@Injectable()
export class EventTypeService {
  constructor(
    @InjectModel(EventType)
    private readonly eventTypeRepository: typeof EventType,
  ) {}

  async list() {
    return this.eventTypeRepository.findAll({
      order: [['name', 'ASC']],
    });
  }

  async create(dto: CreateEventTypeDto) {
    const [eventType] = await this.eventTypeRepository.findOrCreate({
      where: { name: dto.name },
      defaults: { name: dto.name },
    });
    return eventType;
  }

  async update(id: string, dto: CreateEventTypeDto) {
    const eventType = await this.eventTypeRepository.findByPk(id);
    if (!eventType) throw new NotFoundException('Event type not found');

    await eventType.update({ name: dto.name });
    return eventType;
  }

  async delete(id: string) {
    const eventType = await this.eventTypeRepository.findByPk(id);
    if (!eventType) throw new NotFoundException('Event type not found');

    // We can allow delete without restriction since it's just a label list in Settings.
    // existing ceremony_events will just keep their string 'event_type'.
    await eventType.destroy();
    return { success: true };
  }

  async seed() {
    const defaultTypes = ['Mehndi', 'Barat', 'Valima', 'Nikah', 'Other'];
    for (const type of defaultTypes) {
      await this.eventTypeRepository.findOrCreate({
        where: { name: type },
      });
    }
  }
}
