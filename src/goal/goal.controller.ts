import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GoalService } from './goal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/request-with-user.interface';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post('goals')
  async createGoal(
    @Req() req: RequestWithUser,
    @Body()
    body: {
      goal_name: string;
      duration: number;
      daily_action: string;
      daily_learning: string;
      daily_visualization: string;
    },
  ) {
    return this.goalService.createGoal(
      req.user.userId,
      body.goal_name,
      body.duration,
      body.daily_action,
      body.daily_learning,
      body.daily_visualization,
    );
  }

  @Get('goals')
  async getGoals(@Req() req: RequestWithUser) {
    return this.goalService.findGoalsByUserId(req.user.userId);
  }

  @Post('progress/:goalId/complete')
  async completeDailyTasks(
    @Req() req: RequestWithUser,
    @Param('goalId') goalId: string,
  ) {
    return this.goalService.completeDailyTasks(req.user.userId, +goalId);
  }

  @Get('progress')
  async getUserProgress(@Req() req: RequestWithUser) {
    return this.goalService.getUserProgress(req.user.userId);
  }
}
