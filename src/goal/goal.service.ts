import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalService {
  constructor(private readonly prisma: PrismaService) {}

  // 1) Vytvoření nového cíle
  async createGoal(
    userId: number,
    goalName: string,
    duration: number,
    dailyAction: string,
    dailyLearning: string,
    dailyVisualization: string,
  ) {
    try {
      return await this.prisma.goal.create({
        data: {
          goal_name: goalName,
          duration,
          daily_action: dailyAction,
          daily_learning: dailyLearning,
          daily_visualization: dailyVisualization,
          reason: null,
          destination: null,
          new_self: null,
          user: {
            connect: { id: userId },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create goal');
    }
  }

  // 2) Načtení všech cílů přihlášeného uživatele
  async findGoalsByUserId(userId: number) {
    try {
      return await this.prisma.goal.findMany({
        where: { userId },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch goals');
    }
  }

  // 3) Dokončení denních úkolů (zapisuje se do tabulky "progress")
  async completeDailyTasks(userId: number, goalId: number) {
    try {
      const today = new Date();
      const existingProgress = await this.prisma.progress.findFirst({
        where: { userId, goalId },
      });

      if (existingProgress) {
        const lastDate = existingProgress.lastCompletionDate
          ? new Date(existingProgress.lastCompletionDate)
          : null;

        // Pokud už dnes uživatel splnil úkoly, nic neděláme
        if (lastDate && today.toDateString() === lastDate.toDateString()) {
          return existingProgress;
        }

        // Výpočet rozdílu ve dnech
        const diffInDays = lastDate
          ? Math.floor(
              (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
            )
          : null;

        let newStreak = 1;
        if (diffInDays === 1) {
          newStreak = existingProgress.streak + 1;
        } else {
          newStreak = 1; // reset streak
        }

        // Aktualizace progressu
        return await this.prisma.progress.update({
          where: { id: existingProgress.id },
          data: {
            completedDays: existingProgress.completedDays + 1,
            lastCompletionDate: today,
            streak: newStreak,
          },
        });
      } else {
        // Záznam neexistuje => vytvoříme nový
        return await this.prisma.progress.create({
          data: {
            userId,
            goalId,
            completedDays: 1,
            lastCompletionDate: today,
            streak: 1,
          },
        });
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to save progress');
    }
  }

  // 4) Načtení progressu pro přihlášeného uživatele
  async getUserProgress(userId: number) {
    try {
      return await this.prisma.progress.findMany({
        where: { userId },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch progress');
    }
  }

  // 5) Update cíle podle ID
  async updateGoal(userId: number, goalId: number, updateGoalDto: UpdateGoalDto) {
    try {
      // Nejdřív si cíl najdeme, abychom ověřili vlastnictví
      const existingGoal = await this.prisma.goal.findUnique({
        where: { id: goalId },
      });

      if (!existingGoal) {
        throw new NotFoundException(`Cíl s ID ${goalId} nenalezen`);
      }

      // Kontrola, jestli patří přihlášenému uživateli
      if (existingGoal.userId !== userId) {
        throw new ForbiddenException(
          'Nemáte oprávnění upravovat tento cíl (patří jinému uživateli).',
        );
      }

      // Proveď update
      return await this.prisma.goal.update({
        where: { id: goalId },
        data: {
          ...updateGoalDto,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update goal');
    }
  }

  // 6) Získání jednoho cíle podle ID s kontrolou uživatele
  async findGoalById(userId: number, goalId: number) {
    try {
      const goal = await this.prisma.goal.findUnique({
        where: { id: goalId },
      });

      if (!goal) {
        throw new NotFoundException(`Cíl s ID ${goalId} nebyl nalezen`);
      }

      if (goal.userId !== userId) {
        throw new ForbiddenException(
          'Nemáte oprávnění zobrazit tento cíl (patří jinému uživateli).',
        );
      }

      return goal;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Chyba při načítání cíle');
    }
  }
}
