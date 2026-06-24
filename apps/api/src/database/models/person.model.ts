import { Table, Column, Model, DataType, HasMany, BelongsTo, ForeignKey, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Family } from './family.model';
import { Transaction } from './transaction.model';
import { Relation } from './relation.model';

@Table({ tableName: 'persons', timestamps: true })
export class Person extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Family)
  @Column({ type: DataType.UUID, allowNull: false })
  family_id: string;

  @Column({ type: DataType.STRING(150), allowNull: false })
  name: string;

  @ForeignKey(() => Relation)
  @Column({ type: DataType.UUID, allowNull: true })
  relation_id: string;

  @Column({ type: DataType.STRING(20), allowNull: true })
  phone: string;

  @Column({ type: DataType.STRING(150), allowNull: true })
  wife_name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  avatar_url: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  notes: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @BelongsTo(() => Family, 'family_id')
  family: Family;

  @BelongsTo(() => Relation, 'relation_id')
  relation: Relation;

  @HasMany(() => Transaction, 'sender_id')
  sent_transactions: Transaction[];

  @HasMany(() => Transaction, 'receiver_id')
  received_transactions: Transaction[];
}
