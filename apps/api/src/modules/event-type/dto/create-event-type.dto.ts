import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventTypeDto {
  @ApiProperty({ example: 'Mehndi' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
