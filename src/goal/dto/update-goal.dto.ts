// update-goal.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional } from 'class-validator';

export class UpdateGoalDto {
  @ApiPropertyOptional({ description: 'Název cíle' })
  @IsString()
  @IsOptional()
  goal_name?: string;

  @ApiPropertyOptional({ description: 'Důvod' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: 'Cílové umístění' })
  @IsString()
  @IsOptional()
  destination?: string;

  @ApiPropertyOptional({ description: 'Vaše nové já' })
  @IsString()
  @IsOptional()
  new_self?: string;

  @ApiPropertyOptional({ description: 'Denní akce' })
  @IsString()
  @IsOptional()
  daily_action?: string;

  @ApiPropertyOptional({ description: 'Denní učení' })
  @IsString()
  @IsOptional()
  daily_learning?: string;

  @ApiPropertyOptional({ description: 'Denní vizualizace' })
  @IsString()
  @IsOptional()
  daily_visualization?: string;

  @ApiPropertyOptional({ description: 'Délka trvání v dnech' })
  @IsInt()
  @IsOptional()
  duration?: number;
}
