import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Nové uživatelské jméno' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ description: 'Nový email' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Nové celé jméno' })
  @IsString()
  @IsOptional()
  fullname?: string;

  @ApiPropertyOptional({ description: 'Nová adresa' })
  @IsString()
  @IsOptional()
  address?: string;
}
