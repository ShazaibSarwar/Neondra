import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transaction, Wedding, CeremonyEvent, Person } from '../../database/models';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [SequelizeModule.forFeature([Transaction, Wedding, CeremonyEvent, Person])],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
