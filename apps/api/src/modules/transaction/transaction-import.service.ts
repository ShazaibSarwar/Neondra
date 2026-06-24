import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction, TransactionType, Person, CeremonyEvent } from '../../database/models';

interface CsvRow {
  sender_name: string;
  receiver_name: string;
  amount: string;
  type: string;
  transaction_date: string;
  note?: string;
  gift_description?: string;
}

export interface ImportResult {
  total: number;
  imported: number;
  failed: number;
  errors: { row: number; message: string }[];
}

@Injectable()
export class TransactionImportService {
  constructor(
    @InjectModel(Transaction)
    private readonly transactionRepository: typeof Transaction,
    @InjectModel(Person)
    private readonly personRepository: typeof Person,
    @InjectModel(CeremonyEvent)
    private readonly eventRepository: typeof CeremonyEvent,
  ) {}

  generateCsvTemplate(): string {
    const headers = 'sender_name,receiver_name,amount,type,transaction_date,note,gift_description';
    const example = 'Ahmed Khan,Ali Sarwar,5000,cash,2026-06-15,Salami from uncle,';
    return `${headers}\n${example}`;
  }

  async importCsv(
    csvContent: string,
    eventId: string,
    familyId: string,
    userId: string,
  ): Promise<ImportResult> {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new BadRequestException('CSV file must have at least a header and one data row');
    }

    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const requiredCols = ['sender_name', 'receiver_name', 'amount', 'type', 'transaction_date'];
    for (const col of requiredCols) {
      if (!header.includes(col)) {
        throw new BadRequestException(`Missing required column: ${col}`);
      }
    }

    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new BadRequestException('Event not found');
    }

    const persons = await this.personRepository.findAll({ where: { family_id: familyId, is_active: true } });
    const personMap = new Map(persons.map((p) => [p.name.toLowerCase(), p.id]));

    const rows: CsvRow[] = [];
    const errors: { row: number; message: string }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      if (cols.length < requiredCols.length) {
        errors.push({ row: i + 1, message: 'Insufficient columns' });
        continue;
      }

      const row: CsvRow = {
        sender_name: cols[header.indexOf('sender_name')],
        receiver_name: cols[header.indexOf('receiver_name')],
        amount: cols[header.indexOf('amount')],
        type: cols[header.indexOf('type')],
        transaction_date: cols[header.indexOf('transaction_date')],
        note: header.includes('note') ? cols[header.indexOf('note')] : undefined,
        gift_description: header.includes('gift_description') ? cols[header.indexOf('gift_description')] : undefined,
      };

      // Validate row
      const senderId = personMap.get(row.sender_name.toLowerCase());
      if (!senderId) {
        errors.push({ row: i + 1, message: `Sender "${row.sender_name}" not found in family` });
        continue;
      }

      const receiverId = personMap.get(row.receiver_name.toLowerCase());
      if (!receiverId) {
        errors.push({ row: i + 1, message: `Receiver "${row.receiver_name}" not found in family` });
        continue;
      }

      if (senderId === receiverId) {
        errors.push({ row: i + 1, message: 'Sender and receiver must be different' });
        continue;
      }

      const amount = parseFloat(row.amount);
      if (isNaN(amount) || amount < 1 || amount > 10000000) {
        errors.push({ row: i + 1, message: `Invalid amount: ${row.amount}` });
        continue;
      }

      if (!['cash', 'gift_item'].includes(row.type)) {
        errors.push({ row: i + 1, message: `Invalid type: ${row.type}. Use "cash" or "gift_item"` });
        continue;
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(row.transaction_date)) {
        errors.push({ row: i + 1, message: `Invalid date format: ${row.transaction_date}. Use YYYY-MM-DD` });
        continue;
      }

      rows.push(row);
    }

    const total = lines.length - 1;
    const failRate = errors.length / total;

    if (failRate > 0.2) {
      throw new BadRequestException({
        message: `Batch rejected: ${Math.round(failRate * 100)}% of rows failed validation (threshold: 20%)`,
        errors,
        total,
        failed: errors.length,
      });
    }

    // Import valid rows
    for (const row of rows) {
      await this.transactionRepository.create({
        event_id: eventId,
        sender_id: personMap.get(row.sender_name.toLowerCase())!,
        receiver_id: personMap.get(row.receiver_name.toLowerCase())!,
        amount: parseFloat(row.amount) as any,
        type: row.type as TransactionType,
        transaction_date: row.transaction_date,
        note: row.note || undefined,
        gift_description: row.gift_description || undefined,
        created_by: userId,
        include_in_balance: true,
      });
    }

    return {
      total,
      imported: rows.length,
      failed: errors.length,
      errors,
    };
  }
}
