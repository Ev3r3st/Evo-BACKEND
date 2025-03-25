import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CourseService } from './course.service';

@Controller('api/courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  async createCourse(@Body() dto: { name: string; description: string }) {
    return this.courseService.createCourse(dto.name, dto.description);
  }

  @Get()
  async getAllCourses() {
    return this.courseService.findAllCourses();
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

  // Ukázka načtení jedné lekce podle ID
  @Get('lesson/:lessonId')
  async getLessonById(@Param('lessonId', ParseIntPipe) lessonId: number) {
    return this.courseService.findLessonById(lessonId);
  }
}
