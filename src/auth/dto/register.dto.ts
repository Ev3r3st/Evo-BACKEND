import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Username of the user' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Password of the user', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'Email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({ description: 'Address of the user', required: false })
  @IsString()
  address?: string; // volitelné pole pro adresu
}
