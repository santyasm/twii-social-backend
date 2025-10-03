import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'Meu primeiro post!' })
  @IsString()
  content: string;
}
