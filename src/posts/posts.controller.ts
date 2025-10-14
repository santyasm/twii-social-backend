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
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiBody, ApiConsumes, ApiCookieAuth } from '@nestjs/swagger';

@Controller('posts')
@ApiCookieAuth('auth_token')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'O conteúdo do post (obrigatório)',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Opcional: O arquivo de imagem para o post',
        },
      },
      required: ['content'],
    },
  })
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', nullable: true },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Opcional: Nova imagem para o post',
        },
      },
    },
  })
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

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  getFeed(@Req() req: any, @Query('onlyFollowing') onlyFollowing?: string) {
    const filter = onlyFollowing === 'true';
    return this.postsService.getFeed(req.user.id, filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user ? req.user.id : null;

    return this.postsService.findOne(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req?: any) {
    return this.postsService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  likePost(@Param('id') postId: string, @Req() req: any) {
    return this.postsService.likePost(req.user.id, postId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/unlike')
  unlikePost(@Param('id') postId: string, @Req() req: any) {
    return this.postsService.unlikePost(req.user.id, postId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  createComment(
    @Param('id') postId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: any,
  ) {
    return this.postsService.createComment(req.user.id, postId, dto.content);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('comments/:id')
  updateComment(
    @Param('id') commentId: string,
    @Body() dto: UpdateCommentDto,
    @Req() req: any,
  ) {
    return this.postsService.updateComment(req.user.id, commentId, dto.content);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:id')
  deleteComment(@Param('id') commentId: string, @Req() req: any) {
    return this.postsService.deleteComment(req.user.id, commentId);
  }
}
