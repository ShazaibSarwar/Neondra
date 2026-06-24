import { IsString, IsDateString, IsOptional, IsEnum, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateCeremonyEventDto {
  @ApiProperty({ example: 'Mehndi' })
  @IsString()
  event_type: string;

  @ApiPropertyOptional({ example: 'Dholki Night' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  custom_label?: string;

  @ApiProperty({ example: '2026-06-14' })
  @IsDateString()
  event_date: string;

  @ApiPropertyOptional({ example: 'Royal Marquee, Lahore' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  venue?: string;

  @ApiPropertyOptional({ example: '18:00' })
  @IsOptional()
  @IsString()
  start_time?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
