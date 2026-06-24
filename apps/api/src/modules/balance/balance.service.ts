import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { Transaction, CeremonyEvent, Person, Wedding, FamilyMember, Family } from '../../database/models';

export interface PersonBalance {
  person_id: string;
  person_name: string;
  relation: string | null;
  total_given: number;
  total_received: number;
  net_balance: number;
}

export interface EventBalance {
  event_id: string;
  event_type: string;
  custom_label: string | null;
  event_date: string;
  total_collected: number;
  total_transactions: number;
}

export interface WeddingBalance {
  wedding_id: string;
  wedding_title: string;
  total_collected: number;
  total_transactions: number;
  event_balances: EventBalance[];
  person_balances: PersonBalance[];
}

export interface FamilySummary {
  grand_total_given: number;
  grand_total_received: number;
  overall_net: number;
  total_transactions: number;
  total_weddings: number;
  top_contributors: PersonBalance[];
}

@Injectable()
export class BalanceService {
  constructor(
    @InjectModel(Transaction)
    private readonly transactionRepository: typeof Transaction,
    @InjectModel(Person)
    private readonly personRepository: typeof Person,
    @InjectModel(CeremonyEvent)
    private readonly eventRepository: typeof CeremonyEvent,
    @InjectModel(Wedding)
    private readonly weddingRepository: typeof Wedding,
    @InjectModel(FamilyMember)
    private readonly familyMemberRepository: typeof FamilyMember,
  ) {}

  private async sumTransactions(whereClause: any): Promise<number> {
    const result = await this.transactionRepository.findAll({
      attributes: [
        [
          Sequelize.literal('SUM(amount + COALESCE(wife_amount, 0))'),
          'totalAmount'
        ]
      ],
      where: whereClause,
      raw: true,
    });
    return Number((result[0] as any)?.totalAmount || 0);
  }

  async getPersonBalance(familyId: string, personId: string): Promise<PersonBalance> {
    const person = await this.personRepository.findOne({ 
      where: { id: personId, family_id: familyId },
      include: [require('../../database/models').Relation]
    });

    const totalGiven = await this.sumTransactions({
      sender_id: personId,
      is_deleted: false,
      include_in_balance: true,
    });

    const totalReceived = await this.sumTransactions({
      receiver_id: personId,
      is_deleted: false,
      include_in_balance: true,
    });

    return {
      person_id: personId,
      person_name: person?.name || '',
      relation: person?.relation?.name || null,
      total_given: Number(totalGiven),
      total_received: Number(totalReceived),
      net_balance: Number(totalGiven) - Number(totalReceived),
    };
  }

  async getEventBalance(eventId: string): Promise<EventBalance> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });

    const totalCollected = await this.sumTransactions({
      event_id: eventId,
      is_deleted: false,
    });

    const totalTransactions = await this.transactionRepository.count({
      where: {
        event_id: eventId,
        is_deleted: false,
      },
    });

    return {
      event_id: eventId,
      event_type: event?.event_type || '',
      custom_label: event?.custom_label || null,
      event_date: event?.event_date || '',
      total_collected: Number(totalCollected),
      total_transactions: totalTransactions,
    };
  }

  async getWeddingBalance(familyId: string, weddingId: string): Promise<WeddingBalance> {
    const wedding = await this.weddingRepository.findOne({
      where: { id: weddingId, family_id: familyId },
      include: [CeremonyEvent],
    });

    const events = wedding?.events || [];
    const eventIds = events.map((e) => e.id);

    // Event-level balances
    const eventBalances: EventBalance[] = [];
    for (const event of events) {
      const eb = await this.getEventBalance(event.id);
      eventBalances.push(eb);
    }

    // Person-level balances for this wedding
    const personBalances = await this.getPersonBalancesForEvents(familyId, eventIds);

    const totalCollected = eventBalances.reduce((s, e) => s + e.total_collected, 0);
    const totalTransactions = eventBalances.reduce((s, e) => s + e.total_transactions, 0);

    return {
      wedding_id: weddingId,
      wedding_title: wedding?.title || '',
      total_collected: totalCollected,
      total_transactions: totalTransactions,
      event_balances: eventBalances,
      person_balances: personBalances.sort((a, b) => b.total_given - a.total_given),
    };
  }

  async getFamilySummary(familyId: string): Promise<FamilySummary> {
    const familyPersons = await this.personRepository.findAll({ where: { family_id: familyId } });
    const personIds = familyPersons.map(p => p.id);

    const weddings = await this.weddingRepository.findAll({
      where: { family_id: familyId },
      include: [CeremonyEvent],
    });

    const allEventIds = weddings.flatMap((w) => w.events?.map((e) => e.id) || []);

    let grandTotalGiven = 0;
    let grandTotalReceived = 0;
    let totalCount = 0;

    if (personIds.length > 0) {
      grandTotalGiven = await this.sumTransactions({
        sender_id: { [Op.in]: personIds },
        is_deleted: false,
        include_in_balance: true,
      });

      grandTotalReceived = await this.sumTransactions({
        receiver_id: { [Op.in]: personIds },
        is_deleted: false,
        include_in_balance: true,
      });

      totalCount = await this.transactionRepository.count({
        where: {
          [Op.or]: [
            { sender_id: { [Op.in]: personIds } },
            { receiver_id: { [Op.in]: personIds } }
          ],
          is_deleted: false,
        },
      });
    }

    const personBalances = await this.getPersonBalancesForEvents(familyId, allEventIds);
    const topContributors = personBalances
      .filter((p) => p.total_given > 0)
      .sort((a, b) => b.total_given - a.total_given)
      .slice(0, 10);

    return {
      grand_total_given: Number(grandTotalGiven),
      grand_total_received: Number(grandTotalReceived),
      overall_net: Number(grandTotalGiven) - Number(grandTotalReceived),
      total_transactions: totalCount,
      total_weddings: weddings.length,
      top_contributors: topContributors,
    };
  }

  async getCrossWeddingBalance(familyId: string, personId: string): Promise<{
    person: PersonBalance;
    per_wedding: { wedding_id: string; wedding_title: string; given: number; received: number; net: number }[];
  }> {
    const weddings = await this.weddingRepository.findAll({
      where: { family_id: familyId },
      include: [CeremonyEvent],
    });

    const perWedding: { wedding_id: string; wedding_title: string; given: number; received: number; net: number }[] = [];

    for (const wedding of weddings) {
      const eventIds = wedding.events?.map((e) => e.id) || [];
      if (eventIds.length === 0) continue;

      const given = await this.sumTransactions({
        sender_id: personId,
        event_id: { [Op.in]: eventIds },
        is_deleted: false,
        include_in_balance: true,
      });

      const received = await this.sumTransactions({
        receiver_id: personId,
        event_id: { [Op.in]: eventIds },
        is_deleted: false,
        include_in_balance: true,
      });

      if (given > 0 || received > 0) {
        perWedding.push({
          wedding_id: wedding.id,
          wedding_title: wedding.title,
          given: Number(given),
          received: Number(received),
          net: Number(given) - Number(received),
        });
      }
    }

    const overallBalance = await this.getPersonBalance(familyId, personId);

    return { person: overallBalance, per_wedding: perWedding };
  }

  private async getPersonBalancesForEvents(familyId: string, eventIds: string[]): Promise<PersonBalance[]> {
    if (eventIds.length === 0) return [];

    const persons = await this.personRepository.findAll({ 
      where: { family_id: familyId, is_active: true },
      include: [require('../../database/models').Relation]
    });
    const balances: PersonBalance[] = [];

    for (const person of persons) {
      const totalGiven = await this.sumTransactions({
        sender_id: person.id,
        event_id: { [Op.in]: eventIds },
        is_deleted: false,
        include_in_balance: true,
      });

      const totalReceived = await this.sumTransactions({
        receiver_id: person.id,
        event_id: { [Op.in]: eventIds },
        is_deleted: false,
        include_in_balance: true,
      });

      if (totalGiven > 0 || totalReceived > 0) {
        balances.push({
          person_id: person.id,
          person_name: person.name,
          relation: person.relation?.name || null,
          total_given: Number(totalGiven),
          total_received: Number(totalReceived),
          net_balance: Number(totalGiven) - Number(totalReceived),
        });
      }
    }

    return balances;
  }

  async getGlobalDashboardStats(userId: string): Promise<any> {
    // Get all families the user is an active member of
    const userFamilies = await this.familyMemberRepository.findAll({
      where: { user_id: userId, status: 'active' },
      attributes: ['family_id']
    });

    const familyIds = userFamilies.map(f => f.family_id);

    if (familyIds.length === 0) {
      return {
        total_global_balance: 0,
        total_families: 0,
        total_weddings: 0,
        total_transactions: 0,
        recent_transactions: []
      };
    }

    // Get all family persons
    const persons = await this.personRepository.findAll({
      where: { family_id: { [Op.in]: familyIds } },
      attributes: ['id']
    });
    const personIds = persons.map(p => p.id);

    // Calculate global balance
    let totalGiven = 0;
    let totalReceived = 0;
    let totalTxCount = 0;

    if (personIds.length > 0) {
      const given = await this.sumTransactions({
        sender_id: { [Op.in]: personIds },
        is_deleted: false,
        include_in_balance: true,
      });
      totalGiven = Number(given);

      const received = await this.sumTransactions({
        receiver_id: { [Op.in]: personIds },
        is_deleted: false,
        include_in_balance: true,
      });
      totalReceived = Number(received);

      totalTxCount = await this.transactionRepository.count({
        where: {
          [Op.or]: [
            { sender_id: { [Op.in]: personIds } },
            { receiver_id: { [Op.in]: personIds } }
          ],
          is_deleted: false,
        },
      });
    }

    const totalGlobalBalance = totalGiven - totalReceived;

    // Get total weddings
    const totalWeddings = await this.weddingRepository.count({
      where: { family_id: { [Op.in]: familyIds } }
    });

    // Get 5 most recent transactions across these families
    // A transaction belongs to a family if its sender or receiver is in the family
    let recentTransactions: Transaction[] = [];
    if (personIds.length > 0) {
      recentTransactions = await this.transactionRepository.findAll({
        where: {
          [Op.or]: [
            { sender_id: { [Op.in]: personIds } },
            { receiver_id: { [Op.in]: personIds } }
          ],
          is_deleted: false,
        },
        order: [['transaction_date', 'DESC'], ['created_at', 'DESC']],
        limit: 5,
        include: [
          { model: Person, as: 'sender', attributes: ['id', 'name'] },
          { model: Person, as: 'receiver', attributes: ['id', 'name'] },
          { model: CeremonyEvent, as: 'event', attributes: ['id', 'event_type', 'custom_label', 'wedding_id'] }
        ]
      });
    }

    return {
      total_global_balance: totalGlobalBalance,
      total_given: totalGiven,
      total_received: totalReceived,
      total_families: familyIds.length,
      total_weddings: totalWeddings,
      total_transactions: totalTxCount,
      recent_transactions: recentTransactions
    };
  }
}
