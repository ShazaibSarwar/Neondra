import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, Res, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/models';
import { TransactionService } from './transaction.service';
import { TransactionImportService } from './transaction-import.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly importService: TransactionImportService,
  ) {}

  @Get('families/:id/transactions')
  @ApiOperation({ summary: 'List transactions for family' })
  async listByFamily(@Param('id') familyId: string, @Query() filters: FilterTransactionDto) {
    return this.transactionService.listByFamily(familyId, filters);
  }

  @Get('families/:id/weddings/:wId/events/:eId/transactions')
  @ApiOperation({ summary: 'List transactions for event' })
  async listByEvent(@Param('eId') eventId: string, @Query() filters: FilterTransactionDto) {
    return this.transactionService.listByEvent(eventId, filters);
  }

  @Post('families/:id/weddings/:wId/events/:eId/transactions')
  @ApiOperation({ summary: 'Create transaction' })
  async create(
    @Param('eId') eventId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionService.create(eventId, user.id, dto);
  }

  @Put('transactions/:txId')
  @ApiOperation({ summary: 'Update transaction' })
  async update(
    @Param('txId') txId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionService.update(txId, user.id, dto);
  }

  @Delete('transactions/:txId')
  @ApiOperation({ summary: 'Delete transaction (soft delete)' })
  async delete(@Param('txId') txId: string, @CurrentUser() user: User) {
    return this.transactionService.softDelete(txId, user.id);
  }

  @Get('families/:id/weddings/:wId/events/:eId/transactions/template')
  @ApiOperation({ summary: 'Download CSV import template' })
  async downloadTemplate(@Res() res: Response) {
    const csv = this.importService.generateCsvTemplate();
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=transaction-import-template.csv',
    });
    res.send(csv);
  }

  @Post('families/:id/weddings/:wId/events/:eId/transactions/import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Bulk import transactions from CSV' })
  async importCsv(
    @Param('id') familyId: string,
    @Param('eId') eventId: string,
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    const csvContent = file.buffer.toString('utf-8');
    return this.importService.importCsv(csvContent, eventId, familyId, user.id);
  }
}
