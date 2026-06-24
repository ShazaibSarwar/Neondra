import {
  Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Family, FamilyMember, FamilyRole, MembershipStatus, User, Wedding, CeremonyEvent, WeddingSubject, Transaction, Person } from '../../database/models';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

@Injectable()
export class FamilyService {
  constructor(
    @InjectModel(Family)
    private readonly familyRepository: typeof Family,
    @InjectModel(FamilyMember)
    private readonly memberRepository: typeof FamilyMember,
    @InjectModel(User)
    private readonly userRepository: typeof User,
  ) {}

  async listUserFamilies(userId: string) {
    const memberships = await this.memberRepository.findAll({
      where: { user_id: userId, status: MembershipStatus.ACTIVE },
      include: [Family],
    });
    return memberships.map((m) => ({ ...m.family.get({ plain: true }), role: m.role }));
  }

  async create(userId: string, dto: CreateFamilyDto) {
    const family = await this.familyRepository.create({
      ...dto,
      created_by: userId,
    });

    await this.memberRepository.create({
      family_id: family.id,
      user_id: userId,
      role: FamilyRole.ADMIN,
      status: MembershipStatus.ACTIVE,
      joined_at: new Date(),
    });

    return family;
  }

  async getOne(familyId: string, userId: string) {
    await this.requireMembership(familyId, userId);
    return this.familyRepository.findOne({
      where: { id: familyId },
      include: [{ model: FamilyMember, include: [{ model: User, as: 'user' }] }],
    });
  }

  async update(familyId: string, userId: string, dto: UpdateFamilyDto) {
    await this.requireRole(familyId, userId, FamilyRole.ADMIN);
    await this.familyRepository.update(dto, { where: { id: familyId } });
    return this.familyRepository.findOne({ where: { id: familyId } });
  }

  async delete(familyId: string, userId: string) {
    await this.requireRole(familyId, userId, FamilyRole.ADMIN);

    const weddings = await Wedding.findAll({ where: { family_id: familyId } });
    const weddingIds = weddings.map(w => w.id);

    const events = weddingIds.length > 0 
      ? await CeremonyEvent.findAll({ where: { wedding_id: { [Op.in]: weddingIds } } })
      : [];
    const eventIds = events.map(e => e.id);

    const persons = await Person.findAll({ where: { family_id: familyId } });
    const personIds = persons.map(p => p.id);

    const txConditions: any[] = [];
    if (eventIds.length > 0) txConditions.push({ event_id: { [Op.in]: eventIds } });
    if (personIds.length > 0) {
      txConditions.push({ sender_id: { [Op.in]: personIds } });
      txConditions.push({ receiver_id: { [Op.in]: personIds } });
    }

    if (txConditions.length > 0) {
      await Transaction.destroy({ where: { [Op.or]: txConditions } });
    }

    if (weddingIds.length > 0) {
      await CeremonyEvent.destroy({ where: { wedding_id: { [Op.in]: weddingIds } } });
      await WeddingSubject.destroy({ where: { wedding_id: { [Op.in]: weddingIds } } });
      await Wedding.destroy({ where: { family_id: familyId } });
    }

    if (personIds.length > 0) {
      await Person.destroy({ where: { family_id: familyId } });
    }

    await this.memberRepository.destroy({ where: { family_id: familyId } });
    await this.familyRepository.destroy({ where: { id: familyId } });

    return { message: 'Family deleted' };
  }

  async listMembers(familyId: string, userId: string) {
    await this.requireMembership(familyId, userId);
    return this.memberRepository.findAll({
      where: { family_id: familyId, status: MembershipStatus.ACTIVE },
      include: [{ model: User, as: 'user' }],
    });
  }

  async invite(familyId: string, inviterId: string, dto: InviteMemberDto) {
    await this.requireRole(familyId, inviterId, FamilyRole.ADMIN);

    const invitee = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!invitee) {
      throw new NotFoundException('User with this email not found');
    }

    const existing = await this.memberRepository.findOne({
      where: { family_id: familyId, user_id: invitee.id },
    });
    if (existing && existing.status === MembershipStatus.ACTIVE) {
      throw new ConflictException('User is already a member');
    }

    const membership = await this.memberRepository.create({
      family_id: familyId,
      user_id: invitee.id,
      role: dto.role,
      invited_by: inviterId,
      status: MembershipStatus.PENDING,
    });

    return { message: 'Invitation sent', membershipId: membership.id };
  }

  async changeRole(familyId: string, requesterId: string, targetUserId: string, newRole: FamilyRole) {
    await this.requireRole(familyId, requesterId, FamilyRole.ADMIN);

    const target = await this.memberRepository.findOne({
      where: { family_id: familyId, user_id: targetUserId, status: MembershipStatus.ACTIVE },
    });
    if (!target) {
      throw new NotFoundException('Member not found');
    }

    if (target.role === FamilyRole.ADMIN && newRole !== FamilyRole.ADMIN) {
      const adminCount = await this.memberRepository.count({
        where: { family_id: familyId, role: FamilyRole.ADMIN, status: MembershipStatus.ACTIVE },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot demote the last admin');
      }
    }

    target.role = newRole;
    await target.save();
    return { message: 'Role updated' };
  }

  async acceptInvitation(membershipId: string, userId: string) {
    const membership = await this.memberRepository.findOne({
      where: { id: membershipId, user_id: userId, status: MembershipStatus.PENDING },
    });
    if (!membership) {
      throw new NotFoundException('Invitation not found or already processed');
    }

    // BR-010: Check 72-hour expiry
    const hoursSinceInvite = (Date.now() - new Date(membership.created_at).getTime()) / (1000 * 60 * 60);
    if (hoursSinceInvite > 72) {
      throw new BadRequestException('Invitation has expired. Please ask the admin to re-send.');
    }

    membership.status = MembershipStatus.ACTIVE;
    membership.joined_at = new Date();
    await membership.save();
    return { message: 'Invitation accepted' };
  }

  async declineInvitation(membershipId: string, userId: string) {
    const membership = await this.memberRepository.findOne({
      where: { id: membershipId, user_id: userId, status: MembershipStatus.PENDING },
    });
    if (!membership) {
      throw new NotFoundException('Invitation not found');
    }

    membership.status = MembershipStatus.REMOVED;
    await membership.save();
    return { message: 'Invitation declined' };
  }

  async removeMember(familyId: string, requesterId: string, targetUserId: string) {
    await this.requireRole(familyId, requesterId, FamilyRole.ADMIN);

    const target = await this.memberRepository.findOne({
      where: { family_id: familyId, user_id: targetUserId, status: MembershipStatus.ACTIVE },
    });
    if (!target) {
      throw new NotFoundException('Member not found');
    }

    if (target.role === FamilyRole.ADMIN) {
      const adminCount = await this.memberRepository.count({
        where: { family_id: familyId, role: FamilyRole.ADMIN, status: MembershipStatus.ACTIVE },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot remove the last admin');
      }
    }

    target.status = MembershipStatus.REMOVED;
    await target.save();
    return { message: 'Member removed' };
  }

  private async requireMembership(familyId: string, userId: string) {
    const membership = await this.memberRepository.findOne({
      where: { family_id: familyId, user_id: userId, status: MembershipStatus.ACTIVE },
    });
    if (!membership) {
      throw new ForbiddenException('Not a member of this family');
    }
    return membership;
  }

  private async requireRole(familyId: string, userId: string, role: FamilyRole) {
    const membership = await this.requireMembership(familyId, userId);
    if (membership.role !== role && role === FamilyRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    return membership;
  }
}
