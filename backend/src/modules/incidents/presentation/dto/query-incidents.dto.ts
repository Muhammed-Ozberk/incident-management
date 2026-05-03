import { IncidentSeverity, IncidentStatus } from '../../domain/incident.enums';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsIn,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class QueryIncidentsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @IsOptional()
  @IsEnum(IncidentSeverity)
  severity?: IncidentSeverity;

  @IsOptional()
  @IsString()
  service?: string;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
