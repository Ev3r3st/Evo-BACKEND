import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService, // Závislost na UserService
    private readonly configService: ConfigService, // Závislost na ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrahování JWT z hlavičky
      secretOrKey: configService.get<string>('JWT_SECRET'), // Tajný klíč z .env
    });
  }

  // Metoda pro validaci tokenu
  async validate(payload: { sub: number; username: string }) {
    const user = await this.userService.findById(payload.sub); // Hledání uživatele podle ID z tokenu
    if (!user) {
      throw new UnauthorizedException('User not found'); // Pokud uživatel neexistuje
    }
    return user; // Návrat validovaného uživatele
  }
}

export default JwtStrategy;
