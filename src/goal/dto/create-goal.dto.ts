import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'goal_name', description: 'Název cíle' })
  goal_name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'reason', description: 'Důvod pro dosažení cíle' })
  reason: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'destination', description: 'Cílové umístění' })
  destination: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'newSelf', description: 'Vaše nové já' })
  new_self: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'dailyAction', description: 'Denní akce' })
  daily_action: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'dailyLearning', description: 'Denní učení' })
  daily_learning: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'dailyVisualization',
    description: 'Denní vizualizace',
  })
  daily_visualization: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 30, description: 'Délka trvání v dnech' })
  duration: number;
}
