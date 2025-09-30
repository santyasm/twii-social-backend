import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await this.usersService.create({
        ...data,
        password: hashedPassword,
      });

      return this.generateToken(user);
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

  async login(params: { username?: string; email?: string; password: string }) {
    try {
      const { username, email, password } = params;
      let user;

      if (username) {
        user = await this.usersService.findByUsername(username);
      } else if (email) {
        user = await this.usersService.findByEmail(email);
      }

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return this.generateToken(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(
        `Error during login: ${error.message}`,
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
