import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/models';
import { FamilyService } from './family.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@ApiTags('Families')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('families')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Get()
  @ApiOperation({ summary: 'List all families the user belongs to' })
  async list(@CurrentUser() user: User) {
    return this.familyService.listUserFamilies(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new family' })
  async create(@CurrentUser() user: User, @Body() dto: CreateFamilyDto) {
    return this.familyService.create(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get family details' })
  async getOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.familyService.getOne(id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update family details' })
  async update(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: UpdateFamilyDto) {
    return this.familyService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete family (soft delete)' })
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.familyService.delete(id, user.id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List family members' })
  async listMembers(@Param('id') id: string, @CurrentUser() user: User) {
    return this.familyService.listMembers(id, user.id);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite user to family' })
  async invite(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: InviteMemberDto) {
    return this.familyService.invite(id, user.id, dto);
  }

  @Put(':id/members/:userId/role')
  @ApiOperation({ summary: 'Change member role' })
  async changeRole(
    @Param('id') id: string,
    @Param('userId') memberId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.familyService.changeRole(id, user.id, memberId, dto.role);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove member from family' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') memberId: string,
    @CurrentUser() user: User,
  ) {
    return this.familyService.removeMember(id, user.id, memberId);
  }
}
