import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  // Vytvořit nový kurz
  async createCourse(name: string, description: string) {
    try {
      return this.prisma.course.create({
        data: { name, description },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create course');
    }
  }

  // Načíst všechny kurzy
  async findAllCourses() {
    return this.prisma.course.findMany({
      include: { lessons: true },
    });
  }

  // Vytvořit lekci v daném kurzu
  async createLesson(
    courseId: number,
    title: string,
    subtitle: string,
    content: string,
    duration: number,
  ) {
    try {
      return this.prisma.lesson.create({
        data: {
          title,
          subtitle,
          content,
          duration,
          course: { connect: { id: courseId } },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create lesson');
    }
  }

  // Načíst jednu lekci podle ID
  async findLessonById(id: number) {
    return this.prisma.lesson.findUnique({
      where: { id },
    });
  }

  // Načíst všechny lekce daného kurzu
  async findLessonsByCourse(courseId: number) {
    return this.prisma.lesson.findMany({
      where: { courseId },
    });
  }
}
