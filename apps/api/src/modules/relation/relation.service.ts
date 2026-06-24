import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Relation } from '../../database/models';
import { CreateRelationDto } from './dto/create-relation.dto';
import { UpdateRelationDto } from './dto/update-relation.dto';

@Injectable()
export class RelationService {
  constructor(
    @InjectModel(Relation)
    private readonly relationRepository: typeof Relation,
  ) {}

  async create(createDto: CreateRelationDto): Promise<Relation> {
    return this.relationRepository.create({ ...createDto });
  }

  async findAll(): Promise<Relation[]> {
    return this.relationRepository.findAll({
      order: [['name', 'ASC']],
    });
  }

  async findOne(id: string): Promise<Relation> {
    const relation = await this.relationRepository.findByPk(id);
    if (!relation) throw new NotFoundException('Relation not found');
    return relation;
  }

  async update(id: string, updateDto: UpdateRelationDto): Promise<Relation> {
    const relation = await this.findOne(id);
    await relation.update(updateDto);
    return relation;
  }

  async remove(id: string): Promise<void> {
    const relation = await this.findOne(id);
    await relation.destroy();
  }

  async seed(): Promise<void> {
    const allRelations = [
      'Father', 'Mother',
      'Son', 'Daughter',
      'Brother', 'Sister',
      'Uncle (Paternal)', 'Aunt (Paternal)',
      'Uncle (Maternal)', 'Aunt (Maternal)',
      'Grandfather (Paternal)', 'Grandmother (Paternal)',
      'Grandfather (Maternal)', 'Grandmother (Maternal)',
      'Nephew', 'Niece',
      'Cousin (Paternal)', 'Cousin (Maternal)',
      'Father-in-Law', 'Mother-in-Law',
      'Brother-in-Law', 'Sister-in-Law',
      'Son-in-Law', 'Daughter-in-Law',
      'Husband', 'Wife',
      'Phupho (Paternal Aunt)',
      'Khala (Maternal Aunt)',
      'Taya (Elder Paternal Uncle)',
      'Chacha (Younger Paternal Uncle)',
      'Mamoo (Maternal Uncle)',
      'Friend',
      'Colleague',
      'Neighbour',
      'Other',
    ];

    for (const name of allRelations) {
      const exists = await this.relationRepository.findOne({ where: { name } });
      if (!exists) {
        await this.relationRepository.create({ name });
      }
    }
  }
}
