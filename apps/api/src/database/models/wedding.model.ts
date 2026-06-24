import { Table, Column, Model, DataType, HasMany, BelongsTo, ForeignKey, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Family } from './family.model';
import { User } from './user.model';
import { CeremonyEvent } from './ceremony-event.model';
import { WeddingSubject } from './wedding-subject.model';

export enum WeddingStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

@Table({ tableName: 'weddings', timestamps: true })
export class Wedding extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Family)
  @Column({ type: DataType.UUID, allowNull: false })
  family_id: string;

  @Column({ type: DataType.STRING(200), allowNull: false })
  title: string;



  @Column({ type: DataType.DATEONLY, allowNull: false })
  wedding_date: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  location: string;

  @Column({ type: DataType.ENUM(...Object.values(WeddingStatus)), defaultValue: WeddingStatus.UPCOMING })
  status: WeddingStatus;

  @Column({ type: DataType.TEXT, allowNull: true })
  notes: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  created_by: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @BelongsTo(() => Family, 'family_id')
  family: Family;

  @BelongsTo(() => User, 'created_by')
  creator: User;

  @HasMany(() => CeremonyEvent, 'wedding_id')
  events: CeremonyEvent[];

  @HasMany(() => WeddingSubject, 'wedding_id')
  subjects: WeddingSubject[];
}
