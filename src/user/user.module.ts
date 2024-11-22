import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Zajišťuje přístup k UserRepository
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule], // Exportuje UserService a UserRepository, aby byly přístupné v jiných modulech
})
export class UserModule {}
