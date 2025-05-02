import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Delete,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RequestWithUser } from '../auth/request-with-user.interface';

@Controller('/courses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  async createCourse(
    @Body() dto: { name: string; description: string; image?: string },
  ) {
    return this.courseService.createCourse(
      dto.name,
      dto.description,
      dto.image,
    );
  }

  // course.controller.ts

  @Get(':id')
  async getCourseById(@Param('id', ParseIntPipe) courseId: number) {
    return this.courseService.findCourseById(courseId);
  }

  @Get()
  async getAllCourses() {
    return this.courseService.findAllCourses();
  }

  @Get('user/:userId')
  async getUserCourses(@Param('userId', ParseIntPipe) userId: number) {
    return this.courseService.findUserCourses(userId);
  }

  // Získat kurzy přihlášeného uživatele
  @Get('my/courses')
  async getMyEnrolledCourses(@Req() req: RequestWithUser) {
    return this.courseService.findUserCourses(req.user.sub);
  }

  // Zapsat přihlášeného uživatele do kurzu
  @Post(':courseId/enroll')
  async enrollToCourseSelf(
    @Req() req: RequestWithUser,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.courseService.enrollUserToCourse(req.user.sub, courseId);
  }

  @Post(':courseId/enroll/:userId')
  async enrollUserToCourse(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.courseService.enrollUserToCourse(userId, courseId);
  }

  @Delete(':courseId/unenroll/:userId')
  async unenrollUserFromCourse(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.courseService.unenrollUserFromCourse(userId, courseId);
  }

  // Odhlásit přihlášeného uživatele z kurzu
  @Delete(':courseId/unenroll')
  async unenrollFromCourse(
    @Req() req: RequestWithUser,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.courseService.unenrollUserFromCourse(req.user.sub, courseId);
  }

  @Put(':courseId/progress/:userId')
  async updateUserProgress(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: { progress: number },
  ) {
    return this.courseService.updateUserCourseProgress(
      userId,
      courseId,
      dto.progress,
    );
  }

  // Označit lekci jako dokončenou pro přihlášeného uživatele
  @Post(':courseId/lesson/:lessonId/complete')
  async completeLesson(
    @Req() req: RequestWithUser,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
  ) {
    return this.courseService.markLessonAsCompleted(
      req.user.sub,
      courseId,
      lessonId,
    );
  }

  // Získat detail postupu přihlášeného uživatele v kurzu
  @Get(':courseId/progress')
  async getCourseProgress(
    @Req() req: RequestWithUser,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.courseService.getUserCourseProgress(req.user.sub, courseId);
  }

  // Označit kurz jako dokončený pro přihlášeného uživatele
  @Post(':courseId/complete')
  async completeCourse(
    @Req() req: RequestWithUser,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.courseService.markCourseAsCompleted(req.user.sub, courseId);
  }

  @Post(':id/lessons')
  async createLesson(
    @Param('id', ParseIntPipe) courseId: number,
    @Body()
    dto: { title: string; subtitle: string; content: string; duration: number },
  ) {
    return this.courseService.createLesson(
      courseId,
      dto.title,
      dto.subtitle,
      dto.content,
      dto.duration,
    );
  }

  @Get(':id/lessons')
  async getLessonsByCourse(@Param('id', ParseIntPipe) courseId: number) {
    return this.courseService.findLessonsByCourse(courseId);
  }

  @Get('lesson/:lessonId')
  async getLessonById(@Param('lessonId', ParseIntPipe) lessonId: number) {
    return this.courseService.findLessonById(lessonId);
  }

  @Put('lesson/:lessonId')
  async updateLesson(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Body()
    dto: {
      title: string;
      subtitle?: string;
      content: string;
      duration: number;
    },
  ) {
    return this.courseService.updateLesson(
      lessonId,
      dto.title,
      dto.subtitle,
      dto.content,
      dto.duration,
    );
  }

  @Put('lesson/:lessonId/order')
  async updateLessonOrder(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Body() dto: { direction: 'up' | 'down' },
  ) {
    return this.courseService.updateLessonOrder(lessonId, dto.direction);
  }

  @Delete(':id')
  async deleteCourse(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.deleteCourse(id);
  }

  @Put(':id')
  async updateCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { name?: string; description?: string; image?: string },
  ) {
    return this.courseService.updateCourse(id, dto);
  }
}
