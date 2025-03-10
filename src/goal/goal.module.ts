import { Module } from '@nestjs/common';
import { GoalService } from './goal.service';
import { GoalController } from './goal.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [GoalService, PrismaService],
  controllers: [GoalController],
  exports: [GoalService],
})
export class GoalModule {}
