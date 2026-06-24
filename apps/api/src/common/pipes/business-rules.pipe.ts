import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class TransactionAmountPipe implements PipeTransform {
  transform(value: any) {
    if (value.amount !== undefined) {
      const amount = Number(value.amount);
      if (amount <= 0 || amount > 10000000) {
        throw new BadRequestException('BR-001: Amount must be between 1 and 10,000,000 PKR');
      }
    }
    if (value.sender_id && value.receiver_id && value.sender_id === value.receiver_id) {
      throw new BadRequestException('BR-002: Sender and receiver must be different persons');
    }
    return value;
  }
}

@Injectable()
export class CeremonyEventPipe implements PipeTransform {
  transform(value: any) {
    if (value.event_type === 'other') {
      if (!value.custom_label || value.custom_label.trim().length < 2) {
        throw new BadRequestException('BR-007: Custom label of at least 2 characters is required for "Other" event type');
      }
    }
    return value;
  }
}