import { IncidentSeverity, IncidentStatus } from '../../domain/incident.enums';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateIncidentDto {
  @ApiPropertyOptional({ example: 'Database timeout on payment service' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ example: 'Checkout requests are timing out for payment users.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @ApiPropertyOptional({ enum: IncidentSeverity })
  @IsOptional()
  @IsEnum(IncidentSeverity)
  severity?: IncidentSeverity;

  @ApiPropertyOptional({ enum: IncidentStatus })
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @ApiPropertyOptional({ example: '4a0b8c2f-2f15-41d5-b32e-2e9d4f2b2e22' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  serviceId?: string;
}
