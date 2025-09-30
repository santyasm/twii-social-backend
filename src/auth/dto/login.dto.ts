import { IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'yasmin@email.com' })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ example: 'yasmin_santana' })
  @IsOptional()
  username: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @MinLength(6)
  password: string;
}
