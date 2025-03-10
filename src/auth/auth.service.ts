import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  // Metoda pro registraci
  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { username, password, email, fullname, address } = registerDto;

    try {
      // Kontrola, zda uživatel již neexistuje
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      if (existingUser) {
        throw new ConflictException(
          'Uživatel s tímto jménem nebo emailem již existuje',
        );
      }

      // Hashování hesla
      const saltRounds =
        parseInt(this.configService.get<string>('BCRYPT_SALT_ROUNDS'), 10) ||
        10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Vytvoření nového uživatele
      await this.prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          email,
          fullname,
          address,
        },
      });

      return { message: 'Uživatel byl úspěšně zaregistrován' };
    } catch (error) {
      console.error('Error during user registration:', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  // Metoda pro přihlášení
  async login(user: User): Promise<{ access_token: string }> {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
