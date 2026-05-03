import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AiSuggestDto {
  @ApiProperty({ example: 'Server offline' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title!: string;

  @ApiProperty({ example: 'Port 80 is not responding' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description!: string;
}
