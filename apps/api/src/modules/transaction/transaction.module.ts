import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transaction, CeremonyEvent, Wedding, FamilyMember, Person } from '../../database/models';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionImportService } from './transaction-import.service';

@Module({
  imports: [SequelizeModule.forFeature([Transaction, CeremonyEvent, Wedding, FamilyMember, Person])],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionImportService],
  exports: [TransactionService],
})
export class TransactionModule {}
