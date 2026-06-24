import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FamilyRole } from '../../../database/models';

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: FamilyRole })
  @IsEnum(FamilyRole)
  role: FamilyRole;
}
