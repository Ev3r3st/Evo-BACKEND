import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async register(userData: Partial<User>): Promise<User> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: userData.username }, { email: userData.email }],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'Uživatel s tímto jménem nebo emailem již existuje',
      );
    }

    const saltRounds =
      this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    return this.prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        fullname: userData.fullname,
        address: userData.address,
      },
    });
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  // Aktualizace profilu s ověřením uniqueness emailu (a volitelně username)
  async updateUserProfile(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    // Kontrola, zda nový email již není obsazen (mimo aktuálního uživatele)
    if (updateUserDto.email) {
      const existingUserWithEmail = await this.prisma.user.findFirst({
        where: {
          email: updateUserDto.email,
          NOT: { id: userId },
        },
      });
      if (existingUserWithEmail) {
        throw new ConflictException('Email je již obsazen.');
      }
    }

    // Případně kontrola uniqueness uživatelského jména, pokud to potřebuješ
    if (updateUserDto.username) {
      const existingUserWithUsername = await this.prisma.user.findFirst({
        where: {
          username: updateUserDto.username,
          NOT: { id: userId },
        },
      });
      if (existingUserWithUsername) {
        throw new ConflictException('Uživatelské jméno je již obsazeno.');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    });
  }
}
