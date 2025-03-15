import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoalService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Vytvoření nového cíle
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

  // 2. Načtení všech cílů přihlášeného uživatele
  async findGoalsByUserId(userId: number) {
    try {
      return await this.prisma.goal.findMany({
        where: { userId },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch goals');
    }
  }

  // 3. Dokončení denních úkolů (uloží do tabulky Progress)
  async completeDailyTasks(userId: number, goalId: number) {
    try {
      // ===== Pro simulaci dalšího dne: =====
      // Odkomentuj následující řádek a zakomentuj řádek s aktuálním datem.
      //const today = new Date('2025-03-12T00:00:00Z'); // simulace dalšího dne

      // Použij aktuální datum (pro produkci nebo normální testování):
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

        // Rozdíl ve dnech mezi dnes a posledním splněným dnem
        const diffInDays = lastDate
          ? Math.floor(
              (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
            )
          : null;

        let newStreak = 1;
        if (diffInDays === 1) {
          newStreak = existingProgress.streak + 1;
        } else {
          newStreak = 1; // reset streak, pokud den vynechal
        }

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

  // 4. Získání veškerého progressu pro přihlášeného uživatele
  async getUserProgress(userId: number) {
    try {
      return await this.prisma.progress.findMany({
        where: { userId },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch progress');
    }
  }
}
