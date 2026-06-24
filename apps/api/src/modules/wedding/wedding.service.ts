import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Wedding, WeddingStatus, CeremonyEvent, Transaction, WeddingSubject, Person } from '../../database/models';
import { CreateWeddingDto } from './dto/create-wedding.dto';
import { UpdateWeddingDto } from './dto/update-wedding.dto';
import { CreateCeremonyEventDto } from './dto/create-ceremony-event.dto';
import { UpdateCeremonyEventDto } from './dto/update-ceremony-event.dto';

@Injectable()
export class WeddingService {
  constructor(
    @InjectModel(Wedding)
    private readonly weddingRepository: typeof Wedding,
    @InjectModel(CeremonyEvent)
    private readonly eventRepository: typeof CeremonyEvent,
    @InjectModel(WeddingSubject)
    private readonly weddingSubjectRepository: typeof WeddingSubject,
  ) {}

  async list(familyId: string) {
    return this.weddingRepository.findAll({
      where: { family_id: familyId },
      include: [
        CeremonyEvent,
        {
          model: WeddingSubject,
          include: [Person]
        }
      ],
      order: [['wedding_date', 'DESC']],
    });
  }

  async create(familyId: string, userId: string, dto: CreateWeddingDto) {
    const { subject_person_ids, ...weddingData } = dto;
    const wedding = await this.weddingRepository.create({
      ...weddingData,
      family_id: familyId,
      created_by: userId,
    });

    if (subject_person_ids && subject_person_ids.length > 0) {
      await Promise.all(
        subject_person_ids.map(personId =>
          this.weddingSubjectRepository.create({
            wedding_id: wedding.id,
            person_id: personId,
          })
        )
      );
    }
    return this.getOne(wedding.id);
  }

  async getOne(weddingId: string) {
    const wedding = await this.weddingRepository.findOne({
      where: { id: weddingId },
      include: [
        { model: CeremonyEvent, include: [Transaction] },
        { model: WeddingSubject, include: [Person] }
      ],
    });
    if (!wedding) {
      throw new NotFoundException('Wedding not found');
    }
    return wedding;
  }

  async update(weddingId: string, dto: UpdateWeddingDto) {
    const wedding = await this.weddingRepository.findOne({ where: { id: weddingId } });
    if (!wedding) {
      throw new NotFoundException('Wedding not found');
    }
    if (wedding.status === WeddingStatus.ARCHIVED) {
      throw new BadRequestException('Cannot modify an archived wedding');
    }
    const { subject_person_ids, ...weddingData } = dto;
    await this.weddingRepository.update(weddingData, { where: { id: weddingId } });

    if (subject_person_ids) {
      await this.weddingSubjectRepository.destroy({ where: { wedding_id: weddingId } });
      await Promise.all(
        subject_person_ids.map(personId =>
          this.weddingSubjectRepository.create({
            wedding_id: weddingId,
            person_id: personId,
          })
        )
      );
    }

    return this.getOne(weddingId);
  }

  async createEvent(weddingId: string, dto: CreateCeremonyEventDto) {
    const wedding = await this.weddingRepository.findOne({ where: { id: weddingId } });
    if (!wedding) {
      throw new NotFoundException('Wedding not found');
    }
    if (wedding.status === WeddingStatus.ARCHIVED) {
      throw new BadRequestException('Cannot add events to an archived wedding');
    }



    return this.eventRepository.create({
      ...dto,
      wedding_id: weddingId,
    });
  }

  async updateEvent(eventId: string, dto: UpdateCeremonyEventDto) {
    await this.eventRepository.update(dto, { where: { id: eventId } });
    return this.eventRepository.findOne({ where: { id: eventId } });
  }

  async delete(weddingId: string) {
    const wedding = await this.weddingRepository.findOne({ where: { id: weddingId } });
    if (!wedding) {
      throw new NotFoundException('Wedding not found');
    }
    
    // Delete associated subjects
    await this.weddingSubjectRepository.destroy({ where: { wedding_id: weddingId } });
    
    // Find associated events
    const events = await this.eventRepository.findAll({ where: { wedding_id: weddingId } });
    for (const event of events) {
      await Transaction.destroy({ where: { event_id: event.id } });
    }
    
    // Delete events
    await this.eventRepository.destroy({ where: { wedding_id: weddingId } });
    
    // Delete wedding
    await this.weddingRepository.destroy({ where: { id: weddingId } });
    
    return { success: true };
  }

  async deleteEvent(eventId: string) {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    
    // Delete associated transactions
    await Transaction.destroy({ where: { event_id: eventId } });
    
    // Delete event
    await this.eventRepository.destroy({ where: { id: eventId } });
    
    return { success: true };
  }
}
