import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';

@Injectable()
export class GoalService {
  constructor(private readonly prisma: PrismaService) {}

  async createGoal(createGoalDto: CreateGoalDto, userId: number): Promise<any> {
    try {
      return await this.prisma.goal.create({
        data: {
          ...createGoalDto,
          userId,
        },
      });
    } catch (error) {
      console.error('Error saving goal:', error.message);
      throw new InternalServerErrorException('Failed to save goal');
    }
  }

  async findGoalsByUserId(userId: number): Promise<any> {
    try {
      console.log('Hledám cíle pro userId:', userId); // Debug log
      return await this.prisma.goal.findMany({
        where: { userId }, // Filtrujeme podle přihlášeného uživatele
      });
    } catch (error) {
      console.error('Error fetching goals:', error.message);
      throw new InternalServerErrorException('Failed to fetch goals');
    }
  }
}
