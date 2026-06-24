import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Person, FamilyMember, Transaction } from '../../database/models';
import { PersonController } from './person.controller';
import { PersonService } from './person.service';

@Module({
  imports: [SequelizeModule.forFeature([Person, FamilyMember, Transaction, require('../../database/models').Relation])],
  controllers: [PersonController],
  providers: [PersonService],
  exports: [PersonService],
})
export class PersonModule {}
