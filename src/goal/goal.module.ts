import { Module } from '@nestjs/common';
import { GoalService } from './goal.service';
import { GoalController } from './goal.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [GoalController],
  providers: [GoalService, PrismaService],
  exports: [GoalService],
})
export class GoalModule {}
