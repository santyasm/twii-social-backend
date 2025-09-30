import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FollowDto {
  @ApiProperty({ example: 'id-do-usuario-a-ser-seguido' })
  @IsString()
  followingId: string;
}
