import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Patch,
  Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
    @Req() req?: any,
  ) {
    return this.postsService.create(createPostDto, file, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file?: Express.Multer.File,
    @Req() req?: any,
  ) {
    return this.postsService.update(id, updatePostDto, file, req.user.id);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req?: any) {
    return this.postsService.remove(id, req.user.id);
  }
}
