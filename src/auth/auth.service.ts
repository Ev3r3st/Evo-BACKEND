import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { RegisterDto } from '../auth/dto/register.dto'; // Přidání importu pro DTO
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService, // Přidání ConfigService pro načítání konfigurace
    private readonly jwtService: JwtService, // Přidání JwtService pro generování tokenů
  ) {}

  // Metoda pro registraci
  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { username, password, email, fullname, address } = registerDto;

    // Kontrola, zda uživatel již neexistuje
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException(
        'Uživatel s tímto jménem nebo emailem již existuje',
      );
    }

    // Hashování hesla
    const saltRounds =
      this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Vytvoření nového uživatele
    const newUser = this.userRepository.create({
      username,
      password: hashedPassword,
      email,
      fullname,
      address,
    });

    // Uložení uživatele do databáze
    await this.userRepository.save(newUser);

    return { message: 'Uživatel byl úspěšně zaregistrován' };
  }

  // Metoda pro přihlášení
  async login(user: User): Promise<{ access_token: string }> {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
