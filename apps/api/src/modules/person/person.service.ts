import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Person, Transaction } from '../../database/models';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PersonService {
  constructor(
    @InjectModel(Person)
    private readonly personRepository: typeof Person,
    @InjectModel(Transaction)
    private readonly transactionRepository: typeof Transaction,
  ) {}

  async list(familyId: string, search?: string) {
    const where: any = { family_id: familyId, is_active: true };
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }
    return this.personRepository.findAll({ where, order: [['name', 'ASC']] });
  }

  async create(familyId: string, dto: CreatePersonDto) {
    return this.personRepository.create({
      ...dto,
      family_id: familyId,
    });
  }

  async getOneWithBalance(familyId: string, personId: string) {
    const person = await this.personRepository.findOne({
      where: { id: personId, family_id: familyId, is_active: true },
    });
    if (!person) {
      throw new NotFoundException('Person not found');
    }

    const totalGiven = await this.transactionRepository.sum('amount', {
      where: {
        sender_id: personId,
        is_deleted: false,
        include_in_balance: true,
      },
    }) || 0;

    const totalReceived = await this.transactionRepository.sum('amount', {
      where: {
        receiver_id: personId,
        is_deleted: false,
        include_in_balance: true,
      },
    }) || 0;

    return {
      ...person.get({ plain: true }),
      total_given: Number(totalGiven),
      total_received: Number(totalReceived),
      net_balance: Number(totalGiven) - Number(totalReceived),
    };
  }

  async update(personId: string, dto: UpdatePersonDto) {
    await this.personRepository.update(dto, { where: { id: personId } });
    return this.personRepository.findOne({ where: { id: personId } });
  }

  async softDelete(personId: string) {
    const hasTransactions = await this.transactionRepository.count({
      where: {
        [Op.or]: [
          { sender_id: personId, is_deleted: false },
          { receiver_id: personId, is_deleted: false },
        ],
      },
    });

    if (hasTransactions > 0) {
      await this.personRepository.update({ is_active: false }, { where: { id: personId } });
      return { message: 'Person archived (has associated transactions)' };
    }

    await this.personRepository.destroy({ where: { id: personId } });
    return { message: 'Person deleted' };
  }

  async getTransactions(personId: string) {
    return this.transactionRepository.findAll({
      where: {
        [Op.or]: [
          { sender_id: personId, is_deleted: false },
          { receiver_id: personId, is_deleted: false },
        ],
      },
      include: ['sender', 'receiver', 'event'],
      order: [['transaction_date', 'DESC']],
    });
  }
}
