import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiCookieAuth } from '@nestjs/swagger';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from 'src/auth/jwt/optional-jwt-auth.guard';

@Controller('users')
@ApiCookieAuth('auth_token')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Req() req: any) {
    const currentUserId = req.user ? req.user.id : undefined;
    return this.usersService.findAll(currentUserId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    const username = req.user.username;

    return this.usersService.findOne(username, req.user.id);
  }

  @Get(':username')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('username') username: string, @Req() req: any) {
    const currentUserId = req.user ? req.user.id : undefined;
    return this.usersService.findOne(username, currentUserId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bio: { type: 'string', nullable: true },
        name: { type: 'string', nullable: true },
        username: { type: 'string', nullable: true },

        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    const userId = req.user.userId;

    if (id !== userId) {
      throw new UnauthorizedException('You can only update your own user');
    }

    return this.usersService.update(id, updateUserDto, avatar);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  follow(@Param('id') followingId: string, @Req() req: any) {
    return this.usersService.follow(req.user.id, followingId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unfollow')
  unfollow(@Param('id') followingId: string, @Req() req: any) {
    return this.usersService.unfollow(req.user.id, followingId);
  }

  @Get(':id/followers')
  getFollowers(@Param('id') userId: string) {
    return this.usersService.getFollowers(userId);
  }

  @Get(':id/following')
  getFollowing(@Param('id') userId: string) {
    return this.usersService.getFollowing(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/avatar')
  removeAvatar(@Req() req: any) {
    const userId = req.user.id;
    return this.usersService.removeAvatar(userId);
  }
}
