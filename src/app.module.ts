import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GoalModule } from './goal/goal.module';
import { PrismaService } from './prisma/prisma.service';
import { CourseModule } from './Course/course.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    AuthModule,
    GoalModule,
    CourseModule,
  ],

  providers: [PrismaService],
})
export class AppModule {}
