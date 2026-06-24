import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Wedding, CeremonyEvent, FamilyMember } from '../../database/models';
import { WeddingController } from './wedding.controller';
import { WeddingService } from './wedding.service';

@Module({
  imports: [SequelizeModule.forFeature([Wedding, CeremonyEvent, FamilyMember, require('../../database/models').WeddingSubject, require('../../database/models').Person])],
  controllers: [WeddingController],
  providers: [WeddingService],
  exports: [WeddingService],
})
export class WeddingModule {}
