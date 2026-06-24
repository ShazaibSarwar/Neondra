import { Table, Column, Model, DataType, HasMany, BelongsTo, ForeignKey, CreatedAt } from 'sequelize-typescript';
import { Wedding } from './wedding.model';
import { Transaction } from './transaction.model';



@Table({ tableName: 'ceremony_events', timestamps: false })
export class CeremonyEvent extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Wedding)
  @Column({ type: DataType.UUID, allowNull: false })
  wedding_id: string;

  @Column({ type: DataType.STRING(150), allowNull: false })
  event_type: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  custom_label: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  event_date: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  venue: string;

  @Column({ type: DataType.TIME, allowNull: true })
  start_time: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  notes: string;

  @CreatedAt
  @Column({ type: DataType.DATE })
  created_at: Date;

  @BelongsTo(() => Wedding, 'wedding_id')
  wedding: Wedding;

  @HasMany(() => Transaction, 'event_id')
  transactions: Transaction[];
}
