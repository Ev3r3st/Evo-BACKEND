import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token for authentication' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
