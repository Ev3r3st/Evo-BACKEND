import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@Request() req) {
    const userId = req.user.sub; // ID uživatele získáme z payloadu tokenu
    return this.userService.findById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAllUsers() {
    return this.userService.findAll();
  }
}
