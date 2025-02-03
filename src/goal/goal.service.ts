import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { User } from '../user/user.entity';

@Injectable()
export class GoalService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
  ) {}

  async createGoal(createGoalDto: CreateGoalDto, user: User): Promise<Goal> {
    try {
      // Převedení `duration` na číslo
      const duration = parseInt(
        createGoalDto.duration as unknown as string,
        10,
      );

      const goal = this.goalRepository.create({
        ...createGoalDto,
        duration, // Přepsání hodnoty
        user,
      });

      return await this.goalRepository.save(goal);
    } catch (error) {
      console.error('Error saving goal:', error.message);
      throw new InternalServerErrorException('Failed to save goal');
    }
  }
}
