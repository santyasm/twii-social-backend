import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'yasmin_santana' })
  @IsNotEmpty()
  @IsString()
  usernameOrEmail: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @MinLength(6)
  password: string;
}
