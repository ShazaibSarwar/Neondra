import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Relation } from '../../database/models';
import { RelationController } from './relation.controller';
import { RelationService } from './relation.service';

@Module({
  imports: [SequelizeModule.forFeature([Relation])],
  controllers: [RelationController],
  providers: [RelationService],
  exports: [RelationService],
})
export class RelationModule {}
