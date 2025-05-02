import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { LoginDto } from './dto/login.dto';

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
  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: loginDto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id);
    return {
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user.id);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: number) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '30d', // Access token vyprší za 15 minut
        },
      ),
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '70d', // Refresh token vyprší za 7 dní
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
