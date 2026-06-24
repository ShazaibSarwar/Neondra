import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transaction, Person, CeremonyEvent, Wedding, FamilyMember } from '../../database/models';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';

@Module({
  imports: [SequelizeModule.forFeature([Transaction, Person, CeremonyEvent, Wedding, FamilyMember])],
  controllers: [BalanceController],
  providers: [BalanceService],
  exports: [BalanceService],
})
export class BalanceModule {}
