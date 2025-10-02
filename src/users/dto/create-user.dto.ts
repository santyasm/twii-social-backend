import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Yasmin Santana' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'yasmin@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'yasmin_santana' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Fullstack dev apaixonada por NestJS',
    required: false,
  })
  @IsOptional()
  bio?: string;

  @ApiProperty({
    example:
      'https://res.cloudinary.com/flkaaf/image/upload/v1759267728/avatars/mhvasdagaxohrrzjixjjpev29k.png',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  emailVerifyToken?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  emailVerifyExpiry?: Date;
}
