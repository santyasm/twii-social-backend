import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from 'generated/prisma';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const emailVerifyToken = crypto.randomBytes(32).toString('hex');
      const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const user = await this.usersService.create({
        ...dto,
        emailVerifyToken,
        emailVerifyExpiry,
      });

      // Send verification email
      await this.emailService.sendVerificationEmail(
        user.email,
        user.name,
        emailVerifyToken,
      );

      return {
        message:
          'User registered successfully. Please check your email to verify your account.',
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
        },
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('The email provided is already in use.');
      }
      throw new InternalServerErrorException(
        `Error registering user: ${error.message}`,
      );
    }
  }

  async login(dto: LoginDto) {
    try {
      const { usernameOrEmail, password } = dto;
      let user;

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameOrEmail);

      if (!usernameOrEmail) {
        throw new BadRequestException(
          'Username or email must be provided for login.',
        );
      }

      if (isEmail) {
        user = await this.usersService.findByEmail(usernameOrEmail);
      } else {
        user = await this.usersService.findByUsername(usernameOrEmail);
      }

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const passwordValid = await bcrypt.compare(password, user.password);

      if (!passwordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // if (!user.emailVerified) {
      //   throw new UnauthorizedException(
      //     'Please verify your email before logging in',
      //   );
      // }

      return this.generateToken(user);
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException(
        `Error during login: ${error.message}`,
      );
    }
  }

  async verifyEmail(token: string) {
    try {
      const user = await this.usersService.findByEmailVerifyToken(token);

      if (!user) {
        throw new UnauthorizedException('Invalid verification token');
      }

      if (user.emailVerifyExpiry && user.emailVerifyExpiry < new Date()) {
        throw new UnauthorizedException('Verification token has expired');
      }

      await this.usersService.verifyEmail(user.id);

      return {
        message: 'Email verified successfully',
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          emailVerified: true,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(
        `Error verifying email: ${error.message}`,
      );
    }
  }

  async resendVerificationEmail(email: string) {
    try {
      const user = await this.usersService.findByEmail(email);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.emailVerified) {
        throw new ConflictException('Email is already verified');
      }

      // Gerar novo token e atualizar expiração
      const emailVerifyToken = crypto.randomBytes(32).toString('hex');
      const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerifyToken,
          emailVerifyExpiry,
        },
      });

      // Enviar novo email de verificação
      await this.emailService.sendVerificationEmail(
        user.email,
        user.name,
        emailVerifyToken,
      );

      return {
        message: 'Verification email sent successfully',
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException
      )
        throw error;
      throw new InternalServerErrorException(
        `Error resending verification email: ${error.message}`,
      );
    }
  }

  private generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
