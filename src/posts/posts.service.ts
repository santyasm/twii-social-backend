import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
// import { UpdatePostDto } from './dto/update-post.dto';
import cloudinary from 'src/config/cloudinary.config';
import { Prisma } from 'generated/prisma';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createPostDto: CreatePostDto,
    file?: Express.Multer.File,
    authorId?: string,
  ) {
    if (!authorId) {
      throw new Error('Author ID is required to create a post.');
    }

    let imageUrl = createPostDto.imageUrl;

    if (file) {
      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'posts' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        stream.end(file.buffer);
      });
      imageUrl = result.secure_url;
    }

    return this.prisma.post.create({
      data: {
        content: createPostDto.content,
        imageUrl,
        author: {
          connect: { id: authorId },
        },
      },
    });
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    file: Express.Multer.File | undefined,
    userId: string,
  ) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException(`Post with ID "${id}" not found.`);

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own posts.');
    }

    let imageUrl = updatePostDto.imageUrl;

    if (file) {
      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'posts' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        stream.end(file.buffer);
      });
      imageUrl = result.secure_url;
    }

    return this.prisma.post.update({
      where: { id },
      data: { ...updatePostDto, imageUrl },
    });
  }

  findAll() {
    return this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: true },
    });
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!post) throw new NotFoundException(`Post with ID "${id}" not found.`);
    return post;
  }

  async remove(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException(`Post with ID "${id}" not found.`);

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts.');
    }

    return this.prisma.post.delete({ where: { id } });
  }
}
