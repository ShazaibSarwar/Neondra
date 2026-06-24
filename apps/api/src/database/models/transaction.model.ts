import { Table, Column, Model, DataType, BelongsTo, ForeignKey, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { CeremonyEvent } from './ceremony-event.model';
import { Person } from './person.model';
import { User } from './user.model';

export enum TransactionType {
  CASH = 'cash',
  GIFT_ITEM = 'gift_item',
}

@Table({ tableName: 'transactions', timestamps: true })
export class Transaction extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => CeremonyEvent)
  @Column({ type: DataType.UUID, allowNull: false })
  event_id: string;

  @ForeignKey(() => Person)
  @Column({ type: DataType.UUID, allowNull: false })
  sender_id: string;

  @ForeignKey(() => Person)
  @Column({ type: DataType.UUID, allowNull: false })
  receiver_id: string;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false })
  amount: number;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: true })
  wife_amount: number;

  @Column({ type: DataType.ENUM(...Object.values(TransactionType)), allowNull: false })
  type: TransactionType;

  @Column({ type: DataType.STRING(255), allowNull: true })
  gift_description: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  include_in_balance: boolean;

  @Column({ type: DataType.STRING(200), allowNull: true })
  note: string;

  @Column({ type: DataType.DATEONLY, defaultValue: DataType.NOW })
  transaction_date: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_deleted: boolean;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  created_by: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  updated_by: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @BelongsTo(() => CeremonyEvent, 'event_id')
  event: CeremonyEvent;

  @BelongsTo(() => Person, 'sender_id')
  sender: Person;

  @BelongsTo(() => Person, 'receiver_id')
  receiver: Person;

  @BelongsTo(() => User, 'created_by')
  creator: User;

  @BelongsTo(() => User, 'updated_by')
  updater: User;
}
