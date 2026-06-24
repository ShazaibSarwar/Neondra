import { Table, Column, Model, DataType, BelongsTo, ForeignKey, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Wedding } from './wedding.model';
import { Person } from './person.model';

@Table({ tableName: 'wedding_subjects', timestamps: true })
export class WeddingSubject extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @ForeignKey(() => Wedding)
  @Column({ type: DataType.UUID, allowNull: false })
  wedding_id: string;

  @ForeignKey(() => Person)
  @Column({ type: DataType.UUID, allowNull: false })
  person_id: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @BelongsTo(() => Wedding, 'wedding_id')
  wedding: Wedding;

  @BelongsTo(() => Person, 'person_id')
  person: Person;
}
