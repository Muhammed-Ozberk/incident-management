import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Payment API' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: 'Handles payment authorization and checkout flows.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
