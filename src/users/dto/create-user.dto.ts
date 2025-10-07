import { IsEmail, IsNotEmpty, IsOptional, Matches, MinLength, Validate, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { RESERVED_USERNAMES } from 'src/common/constants/reserved-usernames';

@ValidatorConstraint({ name: 'ReservedUsername', async: false })
class ReservedUsernameConstraint implements ValidatorConstraintInterface {
  validate(username: string) {
    return !RESERVED_USERNAMES.includes(username.toLowerCase());
  }

  defaultMessage() {
    return 'This username is reserved or not allowed.';
  }
}

export class CreateUserDto {
  @ApiProperty({ example: 'Yasmin Santana' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'yasmin@email.com' })
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @ApiProperty({ example: 'yasmin_santana' })
  @IsNotEmpty()
  @Transform(({ value }) =>
    value ? value.trim().toLowerCase().replace(/\s+/g, '') : value,
  )
  @Matches(/^[a-z0-9_]{3,20}$/, {
    message:
      'Username must contain only lowercase letters, numbers, or underscores (3–20 chars).',
  })
  @Validate(ReservedUsernameConstraint)
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
