import { IncidentSeverity } from '../../domain/incident.enums';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIncidentDto {
  @ApiProperty({ example: 'Database connection failure', description: 'Title of the incident' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title!: string;

  @ApiProperty({ example: 'Connection timeout after 30s', description: 'Detailed description' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description!: string;

  @ApiPropertyOptional({
    example: '4a0b8c2f-2f15-41d5-b32e-2e9d4f2b2e22',
    description: 'Affected registered service ID. Preferred by the UI.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  serviceId?: string;

  @ApiPropertyOptional({
    example: 'Payment API',
    description: 'Affected registered service name. Supported for case request compatibility.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  service?: string;

  @ApiProperty({ enum: IncidentSeverity, example: IncidentSeverity.HIGH })
  @IsEnum(IncidentSeverity)
  severity!: IncidentSeverity;
}
