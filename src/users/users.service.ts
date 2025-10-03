import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from 'generated/prisma';
import cloudinary from 'src/config/cloudinary.config';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      return await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'The email or username provided is already in use.',
        );
      }
      throw new InternalServerErrorException(
        `Error creating user: ${error.message}`,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.user.findMany();
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error retrieving users: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        omit: {
          password: true,
          emailVerifyToken: true,
          emailVerifyExpiry: true,
          updatedAt: true,
        },
      });
      if (!user) throw new NotFoundException(`User with ID "${id}" not found.`);
      return user;
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Error retrieving user with ID "${id}": ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ) {
    try {
      let avatarUrl: string | undefined = undefined;

      if (file) {
        const result = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'avatars' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );
          stream.end(file.buffer);
          avatarUrl = result.secure_url;
        });

        avatarUrl = result.secure_url;
      }

      const dataToUpdate: Prisma.UserUpdateInput = { ...updateUserDto };

      if (avatarUrl !== undefined) {
        dataToUpdate.avatarUrl = avatarUrl;
      }

      return await this.prisma.user.update({
        where: { id },
        data: dataToUpdate,
      });
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID "${id}" not found.`);
      }
      throw new InternalServerErrorException(
        `Error updating user with ID "${id}": ${error.message}`,
      );
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID "${id}" not found.`);
      }
      throw new InternalServerErrorException(
        `Error deleting user with ID "${id}": ${error.message}`,
      );
    }
  }

  async follow(followerId: string, followingId: string) {
    try {
      if (followerId === followingId) {
        throw new ForbiddenException('You cannot follow yourself.');
      }

      return await this.prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('You are already following this user.');
      }
      throw new InternalServerErrorException(
        `Error following user with ID "${followingId}": ${error.message}`,
      );
    }
  }

  async unfollow(followerId: string, followingId: string) {
    try {
      const result = await this.prisma.follow.deleteMany({
        where: {
          followerId,
          followingId,
        },
      });

      if (result.count === 0) {
        throw new NotFoundException('You are not following this user.');
      }

      return { message: 'Unfollowed successfully.' };
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error unfollowing user with ID "${followingId}": ${error.message}`,
      );
    }
  }

  async getFollowers(userId: string) {
    try {
      return await this.prisma.follow.findMany({
        where: { followingId: userId },
        include: { follower: true },
      });
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error retrieving followers for user ID "${userId}": ${error.message}`,
      );
    }
  }

  async getFollowing(userId: string) {
    try {
      return await this.prisma.follow.findMany({
        where: { followerId: userId },
        include: { following: true },
      });
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error retrieving following for user ID "${userId}": ${error.message}`,
      );
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({ where: { email } });
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error retrieving user with email "${email}": ${error.message}`,
      );
    }
  }

  async findByUsername(username: string) {
    try {
      return await this.prisma.user.findUnique({ where: { username } });
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error retrieving user with username "${username}": ${error.message}`,
      );
    }
  }

  async findByEmailVerifyToken(token: string) {
    try {
      return await this.prisma.user.findFirst({
        where: { emailVerifyToken: token },
      });
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error retrieving user with verification token: ${error.message}`,
      );
    }
  }

  async verifyEmail(userId: string) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          emailVerified: true,
          emailVerifyToken: null,
          emailVerifyExpiry: null,
        },
      });
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error verifying email for user "${userId}": ${error.message}`,
      );
    }
  }

  async removeAvatar(userId: string) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: null },
      });
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error removing avatar for user ID "${userId}": ${error.message}`,
      );
    }
  }
}
