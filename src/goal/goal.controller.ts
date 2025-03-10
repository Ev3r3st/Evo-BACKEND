import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { GoalService } from './goal.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { User } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('api/goals')
@UseGuards(JwtAuthGuard)
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post()
  async createGoal(@Body() createGoalDto: CreateGoalDto, @Req() req: Request) {
    const user = req.user as User; // JWT middleware nastaví uživatele
    return this.goalService.createGoal(createGoalDto, user);
  }
}
