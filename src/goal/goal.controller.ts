import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GoalService } from './goal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/request-with-user.interface';
import { UpdateGoalDto } from './dto/update-goal.dto';

@ApiBearerAuth()
@ApiTags('goals')
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  // 1) Vytvoření nového cíle
  @Post()
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
      req.user.sub,
      body.goal_name,
      body.duration,
      body.daily_action,
      body.daily_learning,
      body.daily_visualization,
    );
  }

  // 2) Načtení všech cílů přihlášeného uživatele
  @Get()
  async getGoals(@Req() req: RequestWithUser) {
    return this.goalService.findGoalsByUserId(req.user.sub);
  }

  // 3) Dokončení denních úkolů (progress)
  @Post('progress/:goalId/complete')
  async completeDailyTasks(
    @Req() req: RequestWithUser,
    @Param('goalId', ParseIntPipe) goalId: number,
  ) {
    return this.goalService.completeDailyTasks(req.user.sub, goalId);
  }

  // 4) Načtení progressu uživatele
  @Get('progress')
  async getUserProgress(@Req() req: RequestWithUser) {
    return this.goalService.getUserProgress(req.user.sub);
  }

  // 5) Update cíle podle ID
  @Put(':goalId')
  async updateGoal(
    @Req() req: RequestWithUser,
    @Param('goalId', ParseIntPipe) goalId: number,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    return this.goalService.updateGoal(req.user.sub, goalId, updateGoalDto);
  }

  // 6) Získání jednoho cíle podle ID
  @Get(':goalId')
  async getGoalById(
    @Req() req: RequestWithUser,
    @Param('goalId', ParseIntPipe) goalId: number,
  ) {
    return this.goalService.findGoalById(req.user.sub, goalId);
  }
}
