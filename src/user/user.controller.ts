import { Controller, Get, UseGuards, Put, Body, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request as ExpressRequest } from 'express';

// Rozšířený typ Request, abychom mohli přistupovat k vlastnosti user
interface RequestWithUser extends ExpressRequest {
  user: any;
}

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@Req() req: RequestWithUser) {
    const userId = req.user.sub; // konzistentně používáme "sub" z JWT
    return this.userService.findById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAllUsers() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateUserProfile(
    @Body() userData: UpdateUserDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub; // používáme "sub" jako ID uživatele
    return this.userService.updateUserProfile(userId, userData);
  }
}
