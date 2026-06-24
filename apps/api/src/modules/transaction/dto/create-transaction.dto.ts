import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsBoolean, IsUUID, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../../../database/models';

export class CreateTransactionDto {
  @ApiProperty()
  @IsUUID()
  sender_id: string;

  @ApiProperty()
  @IsUUID()
  receiver_id: string;

  @ApiProperty({ example: 5000, minimum: 1, maximum: 10000000 })
  @IsNumber()
  @Min(1)
  @Max(10000000)
  amount: number;

  @ApiPropertyOptional({ example: 1000, minimum: 1, maximum: 10000000 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000000)
  wife_amount?: number;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiPropertyOptional({ example: 'Gold necklace set' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  gift_description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  include_in_balance?: boolean;

  @ApiPropertyOptional({ example: 'Salami from Phupho' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;

  @ApiPropertyOptional({ example: '2026-06-15' })
  @IsOptional()
  @IsDateString()
  transaction_date?: string;
}
