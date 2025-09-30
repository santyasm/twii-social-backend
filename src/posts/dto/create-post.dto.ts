import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'Meu primeiro post!' })
  @IsString()
  content: string;

  @ApiProperty({
    example: 'https://link-da-imagem.com/img.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
