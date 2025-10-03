import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

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
    example: 'Fullstack dev apaixonada por JS',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === undefined ? '' : value,
  )
  bio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  emailVerifyToken?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  emailVerifyExpiry?: Date;
}
