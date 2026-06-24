import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TransactionService } from '../transaction.service';
import { Transaction, CeremonyEvent, Wedding, WeddingStatus } from '../../../database/models';

describe('TransactionService', () => {
  let service: TransactionService;
  let transactionRepo: any;
  let eventRepo: any;
  let weddingRepo: any;

  beforeEach(async () => {
    transactionRepo = {
      createQueryBuilder: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      create: jest.fn((data) => ({ id: 'tx-1', ...data })),
      save: jest.fn((tx) => Promise.resolve(tx)),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    eventRepo = {
      findOne: jest.fn(),
    };

    weddingRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: getModelToken(Transaction), useValue: transactionRepo },
        { provide: getModelToken(CeremonyEvent), useValue: eventRepo },
        { provide: getModelToken(Wedding), useValue: weddingRepo },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  describe('create', () => {
    it('should create a transaction successfully', async () => {
      eventRepo.findOne.mockResolvedValue({
        id: 'event-1',
        wedding: { status: WeddingStatus.ACTIVE },
      });

      const dto = {
        sender_id: 'person-1',
        receiver_id: 'person-2',
        amount: 5000,
        type: 'cash' as any,
      };

      const result = await service.create('event-1', 'user-1', dto);
      expect(result.sender_id).toBe('person-1');
      expect(transactionRepo.save).toHaveBeenCalled();
    });

    it('BR-002: should reject same sender and receiver', async () => {
      eventRepo.findOne.mockResolvedValue({
        id: 'event-1',
        wedding: { status: WeddingStatus.ACTIVE },
      });

      await expect(
        service.create('event-1', 'user-1', {
          sender_id: 'same-person',
          receiver_id: 'same-person',
          amount: 5000,
          type: 'cash' as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('BR-005: should reject transaction on archived wedding', async () => {
      eventRepo.findOne.mockResolvedValue({
        id: 'event-1',
        wedding: { status: WeddingStatus.ARCHIVED },
      });

      await expect(
        service.create('event-1', 'user-1', {
          sender_id: 'p1',
          receiver_id: 'p2',
          amount: 1000,
          type: 'cash' as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent event', async () => {
      eventRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create('non-existent', 'user-1', {
          sender_id: 'p1',
          receiver_id: 'p2',
          amount: 1000,
          type: 'cash' as any,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('should allow owner to delete within 24 hours', async () => {
      transactionRepo.findOne.mockResolvedValue({
        id: 'tx-1',
        created_by: 'user-1',
        created_at: new Date(),
        is_deleted: false,
      });

      const result = await service.softDelete('tx-1', 'user-1');
      expect(result.message).toBe('Transaction deleted');
      expect(transactionRepo.update).toHaveBeenCalledWith('tx-1', { is_deleted: true, updated_by: 'user-1' });
    });

    it('BR-006: should reject owner delete after 24 hours', async () => {
      const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000);
      transactionRepo.findOne.mockResolvedValue({
        id: 'tx-1',
        created_by: 'user-1',
        created_at: oldDate,
        is_deleted: false,
      });

      await expect(service.softDelete('tx-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent transaction', async () => {
      transactionRepo.findOne.mockResolvedValue(null);
      await expect(service.softDelete('non-existent', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
