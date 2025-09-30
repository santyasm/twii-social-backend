import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Yasmin Santana' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'yasmin@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'yasmin_santana', required: false })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @MinLength(6)
  password: string;
}
