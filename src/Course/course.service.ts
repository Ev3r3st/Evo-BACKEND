import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  // Vytvořit nový kurz
  async createCourse(name: string, description: string, image?: string) {
    try {
      return this.prisma.course.create({
        data: {
          name,
          description,
          image,
        } as Prisma.CourseCreateInput,
      });
    } catch (error) {
      console.error('Error creating course:', error);
      throw new InternalServerErrorException('Failed to create course');
    }
  }

  // Načíst všechny kurzy
  async findAllCourses() {
    return this.prisma.course.findMany({
      include: {
        lessons: {
          orderBy: {
            order: 'asc',
          } as Prisma.LessonOrderByWithRelationInput,
        },
        users: {
          select: {
            userId: true,
            progress: true,
            completedAt: true,
          },
        },
      },
    });
  }

  // Načíst kurzy uživatele
  async findUserCourses(userId: number) {
    return this.prisma.userCourse.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            lessons: {
              orderBy: {
                order: 'asc',
              } as Prisma.LessonOrderByWithRelationInput,
            },
          },
        },
      },
    });
  }

  // Přihlásit uživatele ke kurzu
  async enrollUserToCourse(userId: number, courseId: number) {
    try {
      return this.prisma.userCourse.create({
        data: {
          userId,
          courseId,
        },
        include: {
          course: true,
        },
      });
    } catch (error) {
      console.error('Error enrolling user to course:', error);
      throw new InternalServerErrorException('Failed to enroll user to course');
    }
  }

  // Odhlásit uživatele z kurzu
  async unenrollUserFromCourse(userId: number, courseId: number) {
    try {
      return this.prisma.userCourse.delete({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });
    } catch (error) {
      console.error('Error unenrolling user from course:', error);
      throw new InternalServerErrorException(
        'Failed to unenroll user from course',
      );
    }
  }
  // course.service.ts

  async findCourseById(courseId: number) {
    return this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: {
            order: 'asc',
          } as Prisma.LessonOrderByWithRelationInput,
        }, // pokud chceš i lekce
        users: {
          // pokud chceš i přihlášené uživatele s progress
          select: {
            userId: true,
            progress: true,
            completedAt: true,
          },
        },
      },
    });
  }

  // Aktualizovat progress uživatele v kurzu
  async updateUserCourseProgress(
    userId: number,
    courseId: number,
    progress: number,
  ) {
    try {
      const userCourse = await this.prisma.userCourse.update({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        data: {
          progress,
          completedAt: progress === 100 ? new Date() : null,
        },
      });
      return userCourse;
    } catch (error) {
      console.error('Error updating course progress:', error);
      throw new InternalServerErrorException(
        'Failed to update course progress',
      );
    }
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
      // Zjistíme počet již existujících lekcí v kurzu pro nastavení pořadí
      const lessonsCount = await this.prisma.lesson.count({
        where: { courseId },
      });

      return this.prisma.lesson.create({
        data: {
          title,
          subtitle,
          content,
          duration,
          order: lessonsCount, // nová lekce bude poslední v pořadí
          course: { connect: { id: courseId } },
        } as Prisma.LessonCreateInput,
      });
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw new InternalServerErrorException('Failed to create lesson');
    }
  }

  // Aktualizovat lekci podle ID
  async updateLesson(
    lessonId: number,
    title: string,
    subtitle: string,
    content: string,
    duration: number,
  ) {
    try {
      // Nejprve ověříme, zda lekce existuje
      const existingLesson = await this.prisma.lesson.findUnique({
        where: { id: lessonId },
      });

      if (!existingLesson) {
        throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
      }

      // Pokud lekce existuje, aktualizujeme ji
      return this.prisma.lesson.update({
        where: { id: lessonId },
        data: {
          title,
          subtitle,
          content,
          duration,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating lesson:', error);
      throw new InternalServerErrorException('Failed to update lesson');
    }
  }

  // Změnit pořadí lekce (posun nahoru nebo dolů)
  async updateLessonOrder(lessonId: number, direction: 'up' | 'down') {
    try {
      // 1. Nejprve získáme aktuální lekci, abychom znali její pořadí a courseId
      const currentLesson = await this.prisma.lesson.findUnique({
        where: { id: lessonId },
      });

      if (!currentLesson) {
        throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
      }

      // 2. Najdeme sousední lekci podle směru pohybu
      const neighborWhere = {
        courseId: currentLesson.courseId,
        order:
          direction === 'up'
            ? { lt: currentLesson.order } // pro posun nahoru hledáme lekci s nižším pořadím
            : { gt: currentLesson.order }, // pro posun dolů hledáme lekci s vyšším pořadím
      };

      // Najdeme nejbližší sousední lekci - seřadíme podle pořadí a vezmeme první
      const neighborLesson = await this.prisma.lesson.findFirst({
        where: neighborWhere,
        orderBy: {
          order: direction === 'up' ? 'desc' : 'asc',
        } as Prisma.LessonOrderByWithRelationInput,
      });

      // Pokud neexistuje sousední lekce, nemůžeme posunout
      if (!neighborLesson) {
        return this.findLessonsByCourse(currentLesson.courseId);
      }

      // 3. Provedeme výměnu pořadí pomocí transakce
      await this.prisma.$transaction([
        // Dočasně nastavíme pořadí aktuální lekce na -1 (abychom zabránili konfliktu)
        this.prisma.lesson.update({
          where: { id: currentLesson.id },
          data: { order: -1 } as Prisma.LessonUpdateInput,
        }),
        // Nastavíme pořadí sousední lekce na pořadí aktuální lekce
        this.prisma.lesson.update({
          where: { id: neighborLesson.id },
          data: { order: currentLesson.order } as Prisma.LessonUpdateInput,
        }),
        // Nastavíme pořadí aktuální lekce na pořadí sousední lekce
        this.prisma.lesson.update({
          where: { id: currentLesson.id },
          data: { order: neighborLesson.order } as Prisma.LessonUpdateInput,
        }),
      ]);

      // Vrátíme aktualizovaný seznam lekcí kurzu
      return this.findLessonsByCourse(currentLesson.courseId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating lesson order:', error);
      throw new InternalServerErrorException('Failed to update lesson order');
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
      orderBy: {
        order: 'asc',
      } as Prisma.LessonOrderByWithRelationInput,
    });
  }

  // Smazat kurz
  async deleteCourse(id: number) {
    try {
      // Použijeme transakci pro zajištění konzistence dat
      await this.prisma.$transaction(async (prisma) => {
        // 1. Nejprve smažeme všechny dokončené lekce patřící ke kurzu
        await prisma.completedLesson.deleteMany({
          where: { courseId: id },
        });

        // 2. Smažeme všechny lekce patřící ke kurzu
        await prisma.lesson.deleteMany({
          where: { courseId: id },
        });

        // 3. Smažeme všechny propojení mezi uživateli a kurzem
        await prisma.userCourse.deleteMany({
          where: { courseId: id },
        });

        // 4. Nakonec smažeme samotný kurz
        await prisma.course.delete({
          where: { id },
        });
      });

      // Vrátíme úspěšný výsledek
      return { success: true, message: 'Course deleted successfully' };
    } catch (error) {
      console.error('Error deleting course:', error);
      throw new InternalServerErrorException('Failed to delete course');
    }
  }

  // Aktualizovat kurz
  async updateCourse(
    id: number,
    data: { name?: string; description?: string; image?: string },
  ) {
    try {
      return this.prisma.course.update({
        where: { id },
        data: data as Prisma.CourseUpdateInput,
      });
    } catch (error) {
      console.error('Error updating course:', error);
      throw new InternalServerErrorException('Failed to update course');
    }
  }

  // Označit lekci jako dokončenou pro uživatele
  async markLessonAsCompleted(
    userId: number,
    courseId: number,
    lessonId: number,
  ) {
    try {
      // Ověříme, zda lekce existuje a patří k danému kurzu
      const lesson = await this.prisma.lesson.findFirst({
        where: {
          id: lessonId,
          courseId: courseId,
        },
      });

      if (!lesson) {
        throw new NotFoundException('Lekce nebyla nalezena v daném kurzu');
      }

      // Ověříme, zda je uživatel zapsán v kurzu
      const userCourse = await this.prisma.userCourse.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

      if (!userCourse) {
        throw new NotFoundException('Uživatel není zapsán v tomto kurzu');
      }

      // Vytvoříme nebo aktualizujeme záznam o dokončené lekci
      const completedLesson = await this.prisma.completedLesson.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
        update: {
          completedAt: new Date(), // Aktualizujeme čas dokončení
        },
        create: {
          userId,
          lessonId,
          courseId,
          completedAt: new Date(),
        },
      });

      // Aktualizujeme celkový progres v kurzu
      await this.updateCourseProgressBasedOnCompletedLessons(userId, courseId);

      return completedLesson;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error marking lesson as completed:', error);
      throw new InternalServerErrorException(
        'Nepodařilo se označit lekci jako dokončenou',
      );
    }
  }

  // Získat detail postupu uživatele v kurzu
  async getUserCourseProgress(userId: number, courseId: number) {
    try {
      // Získáme kurz s lekcemi
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        include: {
          lessons: {
            orderBy: {
              order: 'asc',
            } as Prisma.LessonOrderByWithRelationInput,
          },
        },
      });

      if (!course) {
        throw new NotFoundException('Kurz nebyl nalezen');
      }

      // Získáme zápis uživatele do kurzu
      const userCourseRecord = await this.prisma.userCourse.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

      if (!userCourseRecord) {
        throw new NotFoundException('Uživatel není zapsán v tomto kurzu');
      }

      // Získáme dokončené lekce uživatele pro tento kurz
      const completedLessons = await this.prisma.completedLesson.findMany({
        where: {
          userId,
          courseId,
        },
      });

      // Vytvoříme userCourse objekt podle očekávaného formátu frontendu
      const userCourse = {
        id: userCourseRecord.id,
        progress: userCourseRecord.progress,
        completedAt: userCourseRecord.completedAt,
        course: course,
      };

      // Vracíme data ve formátu, který frontend očekává
      return {
        userCourse,
        completedLessons,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error getting user course progress:', error);
      throw new InternalServerErrorException(
        'Nepodařilo se načíst postup v kurzu',
      );
    }
  }

  // Označit celý kurz jako dokončený
  async markCourseAsCompleted(userId: number, courseId: number) {
    try {
      // Ověříme, zda je uživatel zapsán v kurzu
      const userCourse = await this.prisma.userCourse.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

      if (!userCourse) {
        throw new NotFoundException('Uživatel není zapsán v tomto kurzu');
      }

      // Aktualizujeme záznam uživatele v kurzu
      return this.prisma.userCourse.update({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        data: {
          progress: 100,
          completedAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error marking course as completed:', error);
      throw new InternalServerErrorException(
        'Nepodařilo se označit kurz jako dokončený',
      );
    }
  }

  // Aktualizovat celkový progres v kurzu na základě dokončených lekcí
  private async updateCourseProgressBasedOnCompletedLessons(
    userId: number,
    courseId: number,
  ) {
    // Získáme celkový počet lekcí v kurzu
    const totalLessonsCount = await this.prisma.lesson.count({
      where: { courseId },
    });

    if (totalLessonsCount === 0) return;

    // Získáme počet dokončených lekcí
    const completedLessonsCount = await this.prisma.completedLesson.count({
      where: {
        userId,
        courseId,
      },
    });

    // Vypočteme procento dokončení
    const progressPercentage = Math.round(
      (completedLessonsCount / totalLessonsCount) * 100,
    );

    // Aktualizujeme progress v kurzu
    await this.prisma.userCourse.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: {
        progress: progressPercentage,
        // Pokud jsou všechny lekce dokončené, označíme kurz jako dokončený
        completedAt: progressPercentage === 100 ? new Date() : null,
      },
    });
  }
}
