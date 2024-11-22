import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth') // Skupina endpointů pod tagem 'auth'
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('/register')
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  @ApiResponse({ status: 400, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.userService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    // Generování JWT tokenu
    return this.authService.login(user);
  }
}
