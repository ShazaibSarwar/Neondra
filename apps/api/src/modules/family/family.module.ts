import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Family, FamilyMember, User } from '../../database/models';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';

@Module({
  imports: [SequelizeModule.forFeature([Family, FamilyMember, User, require('../../database/models').Relation])],
  controllers: [FamilyController],
  providers: [FamilyService],
  exports: [FamilyService],
})
export class FamilyModule {}
