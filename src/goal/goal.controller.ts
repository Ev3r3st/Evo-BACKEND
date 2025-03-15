import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { GoalService } from './goal.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/request-with-user.interface';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('api/goals')
@UseGuards(JwtAuthGuard)
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post()
  async createGoal(
    @Body() createGoalDto: CreateGoalDto,
    @Req() req: RequestWithUser,
  ) {
    return this.goalService.createGoal(createGoalDto, req.user.userId);
  }

  @Get()
  async getGoals(@Req() req: RequestWithUser) {
    console.log('Přihlášený uživatel:', req.user.userId); // Debug log
    return this.goalService.findGoalsByUserId(req.user.userId);
  }
}
