import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ReportService } from './report.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('families/:id/weddings/:wId')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('report/pdf')
  @ApiOperation({ summary: 'Download wedding PDF report' })
  async getWeddingPdf(@Param('wId') weddingId: string, @Res() res: Response) {
    const buffer = await this.reportService.generateWeddingPdf(weddingId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=wedding-report-${weddingId}.pdf`,
    });
    res.send(buffer);
  }

  @Get('report/excel')
  @ApiOperation({ summary: 'Download wedding Excel export' })
  async getWeddingExcel(@Param('wId') weddingId: string, @Res() res: Response) {
    const buffer = await this.reportService.generateWeddingExcel(weddingId);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=wedding-report-${weddingId}.xlsx`,
    });
    res.send(buffer);
  }

  @Get('events/:eId/report/pdf')
  @ApiOperation({ summary: 'Download event PDF summary' })
  async getEventPdf(@Param('eId') eventId: string, @Res() res: Response) {
    const buffer = await this.reportService.generateEventPdf(eventId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=event-report-${eventId}.pdf`,
    });
    res.send(buffer);
  }
}