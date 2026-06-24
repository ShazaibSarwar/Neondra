import { Table, Column, Model, DataType, BelongsTo, ForeignKey, CreatedAt } from 'sequelize-typescript';
import { User } from './user.model';
import { Family } from './family.model';

export enum FamilyRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export enum MembershipStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REMOVED = 'removed',
}

@Table({ tableName: 'family_members', timestamps: false })
export class FamilyMember extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Family)
  @Column({ type: DataType.UUID, allowNull: false })
  family_id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  user_id: string;

  @Column({ type: DataType.ENUM(...Object.values(FamilyRole)), allowNull: false })
  role: FamilyRole;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  invited_by: string;

  @Column({ type: DataType.DATE, allowNull: true })
  joined_at: Date;

  @Column({ type: DataType.ENUM(...Object.values(MembershipStatus)), defaultValue: MembershipStatus.PENDING })
  status: MembershipStatus;

  @CreatedAt
  @Column({ type: DataType.DATE })
  created_at: Date;

  @BelongsTo(() => Family, 'family_id')
  family: Family;

  @BelongsTo(() => User, 'user_id')
  user: User;

  @BelongsTo(() => User, 'invited_by')
  inviter: User;
}
