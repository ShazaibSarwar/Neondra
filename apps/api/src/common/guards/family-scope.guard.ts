import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FamilyMember, MembershipStatus } from '../../database/models';

@Injectable()
export class FamilyScopeGuard implements CanActivate {
  constructor(
    @InjectModel(FamilyMember)
    private readonly memberRepository: typeof FamilyMember,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const familyId = request.params.id || request.params.familyId;

    if (!familyId || !user) {
      return true;
    }

    const membership = await this.memberRepository.findOne({
      where: {
        user_id: user.id,
        family_id: familyId,
        status: MembershipStatus.ACTIVE,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Access denied: you are not a member of this family');
    }

    request.familyMembership = membership;
    return true;
  }
}
