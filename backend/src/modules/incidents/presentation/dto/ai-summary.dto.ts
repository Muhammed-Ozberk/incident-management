import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class AiSummaryDto {
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  regenerate?: boolean;
}
