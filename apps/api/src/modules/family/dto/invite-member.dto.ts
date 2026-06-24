import { IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FamilyRole } from '../../../database/models';

export class InviteMemberDto {
  @ApiProperty({ example: 'member@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: FamilyRole, example: FamilyRole.MEMBER })
  @IsEnum(FamilyRole)
  role: FamilyRole;
}
