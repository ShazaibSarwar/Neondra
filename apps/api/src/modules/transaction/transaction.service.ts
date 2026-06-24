import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Transaction, CeremonyEvent, Wedding, WeddingStatus, Person } from '../../database/models';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction)
    private readonly transactionRepository: typeof Transaction,
    @InjectModel(CeremonyEvent)
    private readonly eventRepository: typeof CeremonyEvent,
    @InjectModel(Wedding)
    private readonly weddingRepository: typeof Wedding,
    @InjectModel(Person)
    private readonly personRepository: typeof Person,
  ) {}

  async listByEvent(eventId: string, filters: FilterTransactionDto) {
    const where: any = {
      event_id: eventId,
      is_deleted: false,
    };

    if (filters.person_id) {
      where[Op.or] = [
        { sender_id: filters.person_id },
        { receiver_id: filters.person_id },
      ];
    }
    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.date_from) {
      where.transaction_date = { ...where.transaction_date, [Op.gte]: filters.date_from };
    }
    if (filters.date_to) {
      where.transaction_date = { ...where.transaction_date, [Op.lte]: filters.date_to };
    }

    return this.transactionRepository.findAll({
      where,
      include: ['sender', 'receiver'],
      order: [
        ['transaction_date', 'DESC'],
        ['created_at', 'DESC'],
      ],
    });
  }

  async listByFamily(familyId: string, filters: FilterTransactionDto) {
    const familyPersons = await this.personRepository.findAll({ where: { family_id: familyId } });
    const personIds = familyPersons.map(p => p.id);

    if (personIds.length === 0) return [];

    const where: any = {
      [Op.or]: [
        { sender_id: { [Op.in]: personIds } },
        { receiver_id: { [Op.in]: personIds } }
      ],
      is_deleted: false,
    };

    if (filters.person_id) {
      where[Op.or] = [
        { sender_id: filters.person_id },
        { receiver_id: filters.person_id },
      ];
    }
    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.date_from) {
      where.transaction_date = { ...where.transaction_date, [Op.gte]: filters.date_from };
    }
    if (filters.date_to) {
      where.transaction_date = { ...where.transaction_date, [Op.lte]: filters.date_to };
    }

    return this.transactionRepository.findAll({
      where,
      include: [
        'sender', 
        'receiver', 
        { model: CeremonyEvent, as: 'event', include: ['wedding'] }
      ],
      order: [
        ['transaction_date', 'DESC'],
        ['created_at', 'DESC'],
      ],
      limit: 100, // Limit to 100 for analytics page
    });
  }

  async create(eventId: string, userId: string, dto: CreateTransactionDto) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      include: [Wedding],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.wedding.status === WeddingStatus.ARCHIVED) {
      throw new BadRequestException('Cannot add transactions to an archived wedding');
    }

    if (dto.sender_id === dto.receiver_id) {
      throw new BadRequestException('Sender and receiver must be different persons');
    }

    return this.transactionRepository.create({
      ...dto,
      event_id: eventId,
      created_by: userId,
    });
  }

  async update(txId: string, userId: string, dto: UpdateTransactionDto) {
    const tx = await this.transactionRepository.findOne({ where: { id: txId, is_deleted: false } });
    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    if (dto.sender_id && dto.receiver_id && dto.sender_id === dto.receiver_id) {
      throw new BadRequestException('Sender and receiver must be different persons');
    }

    await this.transactionRepository.update(
      { ...dto, updated_by: userId },
      { where: { id: txId } }
    );
    return this.transactionRepository.findOne({
      where: { id: txId },
      include: ['sender', 'receiver', 'event'],
    });
  }

  async softDelete(txId: string, userId: string) {
    const tx = await this.transactionRepository.findOne({ where: { id: txId, is_deleted: false } });
    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    const isOwner = tx.created_by === userId;
    const hoursSinceCreation = (Date.now() - new Date(tx.created_at).getTime()) / (1000 * 60 * 60);

    if (!isOwner) {
      // Non-owners need admin role — checked at guard level
    } else if (hoursSinceCreation > 24) {
      throw new ForbiddenException('Members can only delete their own transactions within 24 hours');
    }

    await this.transactionRepository.update(
      { is_deleted: true, updated_by: userId },
      { where: { id: txId } }
    );
    return { message: 'Transaction deleted' };
  }
}
