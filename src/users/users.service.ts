import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('The email provided is already in use.');
      }
      throw new InternalServerErrorException(
        `Error creating user: ${error.message}`,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error retrieving users: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID "${id}" not found.`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Error retrieving user with ID "${id}": ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File, // opcional
  ) {
    try {
      let avatarUrl = updateUserDto.avatarUrl;

      if (file) {
        const result = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'avatars' },
            (error, result) => {
              // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
              if (error) return reject(error);
              resolve(result);
            },
          );
          stream.end(file.buffer);
        });

        avatarUrl = result.secure_url;
      }

      return await this.prisma.user.update({
        where: { id },
        data: { ...updateUserDto, avatarUrl },
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
    } catch (error) {
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

  async findByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({ where: { email } });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error retrieving user with email "${email}": ${error.message}`,
      );
    }
  }

  async findByUsername(username: string) {
    try {
      return await this.prisma.user.findUnique({ where: { username } });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error retrieving user with username "${username}": ${error.message}`,
      );
    }
  }
}
