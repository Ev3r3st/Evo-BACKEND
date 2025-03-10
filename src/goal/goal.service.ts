import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { User } from '@prisma/client';

@Injectable()
export class GoalService {
  constructor(private readonly prisma: PrismaService) {}

  async createGoal(createGoalDto: CreateGoalDto, user: User): Promise<any> {
    try {
      const goal = await this.prisma.goal.create({
        data: {
          ...createGoalDto,
          userId: user.id,
        },
      });
      return goal;
    } catch (error) {
      console.error('Error saving goal:', error.message);
      throw new InternalServerErrorException('Failed to save goal');
    }
  }
}
