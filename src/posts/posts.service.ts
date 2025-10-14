import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import cloudinary from 'src/config/cloudinary.config';
import { UpdatePostDto } from './dto/update-post.dto';
import { Prisma } from 'generated/prisma';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) { }

  async create(
    createPostDto: CreatePostDto,
    file?: Express.Multer.File,
    authorId?: string,
  ) {
    if (!authorId) {
      throw new Error('Author ID is required to create a post.');
    }

    let imageUrl: string | undefined = undefined;

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

    let imageUrl: string | undefined = undefined;

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

  async findAll() {
    const posts = await this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,

        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      },
    });

    return posts.map(({ _count, author, ...rest }) => {
      const { password, emailVerifyToken, emailVerified, emailVerifyExpiry, updatedAt, ...safeAuthor } = author;

      return {
        ...rest,
        author: safeAuthor,
        likeCount: _count.likes,
        commentCount: _count.comments,
      }
    });
  }

  async findOne(id: string, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },

      include: {
        author: true,
        likes: userId ? { where: { userId }, select: { id: true } } : false,
        comments: { include: { author: true } },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) throw new NotFoundException(`Post with ID "${id}" not found.`);

    const { password, emailVerifyToken, emailVerified, emailVerifyExpiry, updatedAt, ...safeAuthor } = post.author;

    const { _count, likes, ...rest } = post;

    return {
      ...rest,
      author: safeAuthor,
      likeCount: _count.likes,
      commentCount: _count.comments,
      isLikedByMe: likes?.length > 0 || false,
    };
  }

  async remove(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException(`Post with ID "${id}" not found.`);

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts.');
    }

    return this.prisma.post.delete({ where: { id } });
  }

  async likePost(userId: string, postId: string) {
    try {
      return await this.prisma.like.create({
        data: { userId, postId },
      });
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('You already liked this post.');
      }
      throw new InternalServerErrorException(
        `Error liking post: ${error.message}`,
      );
    }
  }

  async unlikePost(userId: string, postId: string) {
    try {
      const result = await this.prisma.like.deleteMany({
        where: { userId, postId },
      });

      if (result.count === 0) {
        throw new NotFoundException('You have not liked this post.');
      }

      return { message: 'Post unliked successfully.' };
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error unliking post: ${error.message}`,
      );
    }
  }

  async createComment(userId: string, postId: string, content: string) {
    try {
      return await this.prisma.comment.create({
        data: {
          content,
          authorId: userId,
          postId,
        },
      });
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error creating comment: ${error.message}`,
      );
    }
  }

  async updateComment(userId: string, commentId: string, content?: string) {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: { id: commentId },
      });
      if (!comment) throw new NotFoundException('Comment not found.');
      if (comment.authorId !== userId)
        throw new ForbiddenException('You can only edit your own comments.');

      return await this.prisma.comment.update({
        where: { id: commentId },
        data: { content },
      });
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error updating comment: ${error.message}`,
      );
    }
  }

  async deleteComment(userId: string, commentId: string) {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: { id: commentId },
      });
      if (!comment) throw new NotFoundException('Comment not found.');
      if (comment.authorId !== userId)
        throw new ForbiddenException('You can only delete your own comments.');

      return await this.prisma.comment.delete({ where: { id: commentId } });
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error deleting comment: ${error.message}`,
      );
    }
  }

  async getFeed(userId: string, onlyFollowing: boolean = true) {
    try {
      let posts;

      if (onlyFollowing) {
        const following = await this.prisma.follow.findMany({
          where: { followerId: userId },
          select: { followingId: true },
        });

        const followingIds = following.map((f) => f.followingId);

        posts = await this.prisma.post.findMany({
          where: { authorId: { in: followingIds } },
          orderBy: { createdAt: 'desc' },
          include: {
            author: true,

            likes: userId ? { where: { userId }, select: { id: true } } : false,

            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        });
      } else {
        posts = await this.prisma.post.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            author: true,

            likes: userId ? { where: { userId }, select: { id: true } } : false,

            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        });
      }

      return posts.map(({ _count, author, likes, ...rest }) => {
        const { password, emailVerifyToken, emailVerified, emailVerifyExpiry, updatedAt, ...safeAuthor } = author;

        return {
          ...rest,
          author: safeAuthor,
          likeCount: _count.likes,
          commentCount: _count.comments,
          isLikedByMe: likes?.length > 0 || false,
        }
      });

    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error fetching feed: ${error.message}`,
      );
    }
  }

}
