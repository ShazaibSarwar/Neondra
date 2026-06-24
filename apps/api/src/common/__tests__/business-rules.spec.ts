import { BadRequestException } from '@nestjs/common';
import { TransactionAmountPipe, CeremonyEventPipe } from '../pipes/business-rules.pipe';

describe('Business Rules Pipes', () => {
  describe('TransactionAmountPipe', () => {
    const pipe = new TransactionAmountPipe();

    it('should pass valid transaction data', () => {
      const data = { sender_id: 'a', receiver_id: 'b', amount: 5000 };
      expect(pipe.transform(data)).toEqual(data);
    });

    it('BR-001: should reject amount = 0', () => {
      expect(() => pipe.transform({ amount: 0 })).toThrow(BadRequestException);
    });

    it('BR-001: should reject amount > 10,000,000', () => {
      expect(() => pipe.transform({ amount: 10000001 })).toThrow(BadRequestException);
    });

    it('BR-001: should reject negative amount', () => {
      expect(() => pipe.transform({ amount: -100 })).toThrow(BadRequestException);
    });

    it('BR-001: should accept amount = 1 (minimum)', () => {
      const data = { sender_id: 'a', receiver_id: 'b', amount: 1 };
      expect(pipe.transform(data)).toEqual(data);
    });

    it('BR-001: should accept amount = 10,000,000 (maximum)', () => {
      const data = { sender_id: 'a', receiver_id: 'b', amount: 10000000 };
      expect(pipe.transform(data)).toEqual(data);
    });

    it('BR-002: should reject same sender and receiver', () => {
      expect(() => pipe.transform({ sender_id: 'same', receiver_id: 'same', amount: 5000 })).toThrow(BadRequestException);
    });

    it('BR-002: should pass different sender and receiver', () => {
      const data = { sender_id: 'a', receiver_id: 'b', amount: 5000 };
      expect(pipe.transform(data)).toEqual(data);
    });
  });

  describe('CeremonyEventPipe', () => {
    const pipe = new CeremonyEventPipe();

    it('should pass non-other event types without custom_label', () => {
      const data = { event_type: 'mehndi', event_date: '2026-06-15' };
      expect(pipe.transform(data)).toEqual(data);
    });

    it('BR-007: should reject "other" type without custom_label', () => {
      expect(() => pipe.transform({ event_type: 'other' })).toThrow(BadRequestException);
    });

    it('BR-007: should reject "other" type with short custom_label', () => {
      expect(() => pipe.transform({ event_type: 'other', custom_label: 'X' })).toThrow(BadRequestException);
    });

    it('BR-007: should accept "other" type with valid custom_label', () => {
      const data = { event_type: 'other', custom_label: 'Dholki Night' };
      expect(pipe.transform(data)).toEqual(data);
    });
  });
});
