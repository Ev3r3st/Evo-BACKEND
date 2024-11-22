import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { User } from '../user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Zajistí přístup k UserRepository v tomto modulu
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'default_secret',
        signOptions: { expiresIn: '3600s' },
      }),
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService], // Pokud `AuthService` bude potřeba v jiném modulu
})
export class AuthModule {}
