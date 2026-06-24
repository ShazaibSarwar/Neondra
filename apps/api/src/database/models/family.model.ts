import { Table, Column, Model, DataType, HasMany, BelongsTo, ForeignKey, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { User } from './user.model';
import { FamilyMember } from './family-member.model';
import { Person } from './person.model';
import { Wedding } from './wedding.model';

@Table({ tableName: 'families', timestamps: true })
export class Family extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING(150), allowNull: false })
  name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  photo_url: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  created_by: string;

  @BelongsTo(() => User, 'created_by')
  creator: User;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @HasMany(() => FamilyMember, 'family_id')
  members: FamilyMember[];

  @HasMany(() => Person, 'family_id')
  persons: Person[];

  @HasMany(() => Wedding, 'family_id')
  weddings: Wedding[];
}
