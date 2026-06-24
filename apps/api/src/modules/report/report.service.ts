import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction, Wedding, CeremonyEvent, Person } from '../../database/models';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Transaction)
    private readonly transactionRepository: typeof Transaction,
    @InjectModel(Wedding)
    private readonly weddingRepository: typeof Wedding,
    @InjectModel(CeremonyEvent)
    private readonly eventRepository: typeof CeremonyEvent,
    @InjectModel(Person)
    private readonly personRepository: typeof Person,
  ) {}

  async generateWeddingPdf(weddingId: string): Promise<Buffer> {
    const wedding = await this.weddingRepository.findOne({
      where: { id: weddingId },
      include: [
        CeremonyEvent,
        {
          model: require('../../database/models').WeddingSubject,
          include: [require('../../database/models').Person],
        },
      ],
    });
    if (!wedding) throw new NotFoundException('Wedding not found');

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));

    // --- Cover Page ---
    doc.moveDown(6);
    doc.fontSize(28).fillColor('#16a34a').text('WFGTS', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(20).fillColor('#333').text('Wedding Financial Report', { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(16).text(wedding.title, { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(12).fillColor('#666');
    if (wedding.subjects && wedding.subjects.length > 0) {
      const subjectNames = wedding.subjects.map(s => s.person?.name || '').filter(Boolean).join(' & ');
      if (subjectNames) {
        doc.text(subjectNames, { align: 'center' });
      }
    }
    doc.text(`Date: ${wedding.wedding_date}`, { align: 'center' });
    if (wedding.location) doc.text(`Location: ${wedding.location}`, { align: 'center' });
    doc.moveDown(4);
    doc.fontSize(10).fillColor('#999').text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });

    // --- Transaction Log by Event ---
    doc.addPage();
    doc.fontSize(16).fillColor('#333').text('Transaction Log', { underline: true });
    doc.moveDown();

    let grandTotal = 0;
    const personBalances = new Map<string, { name: string; given: number; received: number }>();

    for (const event of wedding.events || []) {
      const transactions = await this.transactionRepository.findAll({
        where: { event_id: event.id, is_deleted: false },
        include: ['sender', 'receiver'],
        order: [['transaction_date', 'ASC']],
      });

      const eventLabel = event.custom_label || event.event_type.toUpperCase();
      doc.fontSize(13).fillColor('#16a34a').text(`${eventLabel} — ${event.event_date}`);
      doc.moveDown(0.3);

      if (transactions.length === 0) {
        doc.fontSize(10).fillColor('#999').text('  No transactions recorded');
        doc.moveDown();
        continue;
      }

      // Table header
      doc.fontSize(9).fillColor('#666');
      const startX = 50;
      doc.text('Date', startX, doc.y, { width: 70, continued: false });
      const headerY = doc.y - 12;
      doc.text('Sender', startX + 75, headerY, { width: 110 });
      doc.text('Receiver', startX + 190, headerY, { width: 110 });
      doc.text('Amount (PKR)', startX + 310, headerY, { width: 90, align: 'right' });
      doc.moveDown(0.3);
      doc.moveTo(startX, doc.y).lineTo(545, doc.y).stroke('#ddd');
      doc.moveDown(0.3);

      let eventTotal = 0;
      doc.fontSize(9).fillColor('#333');

      for (const tx of transactions) {
        const y = doc.y;
        if (y > 720) { doc.addPage(); }

        const amount = Number(tx.amount);
        eventTotal += amount;
        grandTotal += amount;

        doc.text(tx.transaction_date, startX, doc.y, { width: 70, continued: false });
        const rowY = doc.y - 12;
        doc.text(tx.sender?.name || '', startX + 75, rowY, { width: 110 });
        doc.text(tx.receiver?.name || '', startX + 190, rowY, { width: 110 });
        doc.text(amount.toLocaleString(), startX + 310, rowY, { width: 90, align: 'right' });
        
        if (tx.include_in_balance) {
          const sKey = tx.sender_id;
          const rKey = tx.receiver_id;
          if (!personBalances.has(sKey)) personBalances.set(sKey, { name: tx.sender?.name || '', given: 0, received: 0 });
          if (!personBalances.has(rKey)) personBalances.set(rKey, { name: tx.receiver?.name || '', given: 0, received: 0 });
          personBalances.get(sKey)!.given += amount;
          personBalances.get(rKey)!.received += amount;
        }

        doc.moveDown(0.15);
      }

      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#16a34a').text(`Event Total: PKR ${eventTotal.toLocaleString()}`, { align: 'right' });
      doc.moveDown(1);
    }

    // --- Person Summary ---
    doc.addPage();
    doc.fontSize(16).fillColor('#333').text('Balance Summary by Person', { underline: true });
    doc.moveDown();

    const bX = 50;
    doc.fontSize(9).fillColor('#666');
    doc.text('Person', bX, doc.y, { width: 150, continued: false });
    const bHeaderY = doc.y - 12;
    doc.text('Given (PKR)', bX + 155, bHeaderY, { width: 100, align: 'right' });
    doc.text('Received (PKR)', bX + 260, bHeaderY, { width: 100, align: 'right' });
    doc.text('Net (PKR)', bX + 365, bHeaderY, { width: 100, align: 'right' });
    doc.moveDown(0.3);
    doc.moveTo(bX, doc.y).lineTo(545, doc.y).stroke('#ddd');
    doc.moveDown(0.3);

    const sorted = Array.from(personBalances.values()).sort((a, b) => b.given - a.given);
    doc.fontSize(9).fillColor('#333');
    for (const bal of sorted) {
      if (doc.y > 720) doc.addPage();
      const net = bal.given - bal.received;
      doc.text(bal.name, bX, doc.y, { width: 150, continued: false });
      const rowY = doc.y - 12;
      doc.text(bal.given.toLocaleString(), bX + 155, rowY, { width: 100, align: 'right' });
      doc.text(bal.received.toLocaleString(), bX + 260, rowY, { width: 100, align: 'right' });
      doc.fillColor(net >= 0 ? '#16a34a' : '#dc2626')
        .text((net >= 0 ? '+' : '') + net.toLocaleString(), bX + 365, rowY, { width: 100, align: 'right' });
      doc.fillColor('#333');
      doc.moveDown(0.2);
    }

    // --- Grand Total ---
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#333');
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#333').text(`Grand Total: PKR ${grandTotal.toLocaleString()}`, { align: 'right' });

    doc.end();
    return new Promise((resolve) => { doc.on('end', () => resolve(Buffer.concat(buffers))); });
  }

  async generateWeddingExcel(weddingId: string): Promise<Buffer> {
    const ExcelJS = require('exceljs');
    const wedding = await this.weddingRepository.findOne({
      where: { id: weddingId },
      include: [
        CeremonyEvent,
        {
          model: require('../../database/models').WeddingSubject,
          include: [require('../../database/models').Person],
        },
      ],
    });
    if (!wedding) throw new NotFoundException('Wedding not found');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'WFGTS';
    workbook.created = new Date();

    // Gather all transactions for this wedding
    const weddingEventIds = (wedding.events || []).map((e) => e.id);
    let weddingTxns: Transaction[] = [];
    if (weddingEventIds.length > 0) {
      weddingTxns = await this.transactionRepository.findAll({
        where: { event_id: weddingEventIds, is_deleted: false },
        include: ['sender', 'receiver', 'event'],
        order: [['transaction_date', 'ASC']],
      });
    }

    // Sheet 1: All Transactions
    const txSheet = workbook.addWorksheet('All Transactions');
    txSheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Event', key: 'event', width: 15 },
      { header: 'Sender', key: 'sender', width: 22 },
      { header: 'Receiver', key: 'receiver', width: 22 },
      { header: 'Amount (PKR)', key: 'amount', width: 15 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Note', key: 'note', width: 25 },
    ];
    txSheet.getRow(1).font = { bold: true };

    for (const tx of weddingTxns) {
      txSheet.addRow({
        date: tx.transaction_date,
        event: tx.event?.custom_label || tx.event?.event_type || '',
        sender: tx.sender?.name || '',
        receiver: tx.receiver?.name || '',
        amount: Number(tx.amount),
        type: tx.type,
        note: tx.note || '',
      });
    }

    // Sheet 2: Person Summary
    const personSheet = workbook.addWorksheet('Person Summary');
    personSheet.columns = [
      { header: 'Person', key: 'name', width: 25 },
      { header: 'Relation', key: 'relation', width: 15 },
      { header: 'Total Given (PKR)', key: 'given', width: 18 },
      { header: 'Total Received (PKR)', key: 'received', width: 18 },
      { header: 'Net Balance (PKR)', key: 'net', width: 18 },
    ];
    personSheet.getRow(1).font = { bold: true };

    const personBalances = new Map<string, { name: string; relation: string; given: number; received: number }>();
    for (const tx of weddingTxns) {
      if (tx.include_in_balance) {
        const sKey = tx.sender_id;
        const rKey = tx.receiver_id;
        if (!personBalances.has(sKey)) personBalances.set(sKey, { name: tx.sender?.name || '', relation: tx.sender?.relation?.name || '', given: 0, received: 0 });
        if (!personBalances.has(rKey)) personBalances.set(rKey, { name: tx.receiver?.name || '', relation: tx.receiver?.relation?.name || '', given: 0, received: 0 });
        personBalances.get(sKey)!.given += Number(tx.amount);
        personBalances.get(rKey)!.received += Number(tx.amount);
      }
    }

    for (const [, bal] of personBalances) {
      personSheet.addRow({ name: bal.name, relation: bal.relation, given: bal.given, received: bal.received, net: bal.given - bal.received });
    }

    // Sheet 3: Event Summary
    const eventSheet = workbook.addWorksheet('Event Summary');
    eventSheet.columns = [
      { header: 'Event', key: 'event', width: 20 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Venue', key: 'venue', width: 20 },
      { header: 'Transactions', key: 'count', width: 14 },
      { header: 'Total Amount (PKR)', key: 'total', width: 18 },
    ];
    eventSheet.getRow(1).font = { bold: true };

    for (const event of wedding.events || []) {
      const eventTxns = weddingTxns.filter((t) => t.event_id === event.id);
      const total = eventTxns.reduce((sum, t) => sum + Number(t.amount), 0);
      eventSheet.addRow({
        event: event.custom_label || event.event_type,
        date: event.event_date,
        venue: event.venue || '',
        count: eventTxns.length,
        total,
      });
    }

    return workbook.xlsx.writeBuffer();
  }

  async generateEventPdf(eventId: string): Promise<Buffer> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      include: [Wedding],
    });
    if (!event) throw new NotFoundException('Event not found');

    const transactions = await this.transactionRepository.findAll({
      where: { event_id: eventId, is_deleted: false },
      include: ['sender', 'receiver'],
      order: [['transaction_date', 'ASC']],
    });

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));

    const eventLabel = event.custom_label || event.event_type.toUpperCase();

    // Header
    doc.fontSize(18).fillColor('#16a34a').text(`${eventLabel} — Event Summary`, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#666');
    doc.text(`Wedding: ${event.wedding?.title || ''}`, { align: 'center' });
    doc.text(`Date: ${event.event_date} | Venue: ${event.venue || 'N/A'}`, { align: 'center' });
    doc.moveDown(1);

    const total = transactions.reduce((s, t) => s + Number(t.amount), 0);
    doc.fontSize(12).fillColor('#333');
    doc.text(`Total Transactions: ${transactions.length}    |    Total: PKR ${total.toLocaleString()}`);
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#ddd');
    doc.moveDown(0.5);

    // Table
    doc.fontSize(9).fillColor('#666');
    const x = 50;
    doc.text('Date', x, doc.y);
    const hy = doc.y - 12;
    doc.text('Sender', x + 70, hy);
    doc.text('Receiver', x + 195, hy);
    doc.text('Amount', x + 330, hy, { width: 80, align: 'right' });
    doc.text('Note', x + 415, hy);
    doc.moveDown(0.3);
    doc.moveTo(x, doc.y).lineTo(545, doc.y).stroke('#eee');
    doc.moveDown(0.3);

    doc.fontSize(9).fillColor('#333');
    for (const tx of transactions) {
      if (doc.y > 740) doc.addPage();
      doc.text(tx.transaction_date, x, doc.y);
      const ry = doc.y - 12;
      doc.text(tx.sender?.name || '', x + 70, ry, { width: 120 });
      doc.text(tx.receiver?.name || '', x + 195, ry, { width: 120 });
      doc.text(Number(tx.amount).toLocaleString(), x + 330, ry, { width: 80, align: 'right' });
      doc.text(tx.note || '', x + 415, ry, { width: 80 });
      doc.moveDown(0.15);
    }

    doc.end();
    return new Promise((resolve) => { doc.on('end', () => resolve(Buffer.concat(buffers))); });
  }
}
