import { IsString, IsDateString, IsOptional, IsEnum, MaxLength, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WeddingStatus } from '../../../database/models';

export class CreateWeddingDto {
  @ApiProperty({ example: 'Ali & Zara Wedding 2026' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ type: [String], description: 'Array of Person UUIDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subject_person_ids?: string[];

  @ApiProperty({ example: '2026-06-15' })
  @IsDateString()
  wedding_date: string;

  @ApiPropertyOptional({ example: 'Lahore' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({ enum: WeddingStatus })
  @IsOptional()
  @IsEnum(WeddingStatus)
  status?: WeddingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
