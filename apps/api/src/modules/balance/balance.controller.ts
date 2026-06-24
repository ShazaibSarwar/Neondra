import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BalanceService } from './balance.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/models/user.model';

@ApiTags('Balance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get global dashboard statistics for the current user' })
  async getDashboardStats(@CurrentUser() user: User) {
    return this.balanceService.getGlobalDashboardStats(user.id);
  }

  @Get('families/:id/balance')
  @ApiOperation({ summary: 'Get family-wide financial summary' })
  async getFamilySummary(@Param('id') familyId: string) {
    return this.balanceService.getFamilySummary(familyId);
  }

  @Get('families/:id/weddings/:wId/balance')
  @ApiOperation({ summary: 'Get wedding balance with event and person breakdowns' })
  async getWeddingBalance(@Param('id') familyId: string, @Param('wId') weddingId: string) {
    return this.balanceService.getWeddingBalance(familyId, weddingId);
  }

  @Get('families/:id/persons/:personId/balance')
  @ApiOperation({ summary: 'Get per-person balance' })
  async getPersonBalance(@Param('id') familyId: string, @Param('personId') personId: string) {
    return this.balanceService.getPersonBalance(familyId, personId);
  }

  @Get('families/:id/persons/:personId/balance/cross-wedding')
  @ApiOperation({ summary: 'Get cross-wedding balance for a person' })
  async getCrossWeddingBalance(@Param('id') familyId: string, @Param('personId') personId: string) {
    return this.balanceService.getCrossWeddingBalance(familyId, personId);
  }

  @Get('families/:id/weddings/:wId/events/:eId/balance')
  @ApiOperation({ summary: 'Get event-level balance' })
  async getEventBalance(@Param('eId') eventId: string) {
    return this.balanceService.getEventBalance(eventId);
  }
}