import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRelationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
