import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService, // Přidání ConfigService
  ) {}

  // Metoda pro vyhledání uživatele podle ID
  async findById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  // Metoda pro vyhledání všech uživatelů
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // Metoda pro registraci nového uživatele
  async register(userData: Partial<User>): Promise<User> {
    // Kontrola, zda uživatel již neexistuje
    const existingUser = await this.userRepository.findOne({
      where: [{ username: userData.username }, { email: userData.email }],
    });

    if (existingUser) {
      throw new ConflictException(
        'Uživatel s tímto jménem nebo emailem již existuje',
      );
    }

    // Hashování hesla
    const saltRounds =
      this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Vytvoření nového uživatele
    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

  // Metoda pro validaci uživatele při přihlášení
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }
}
