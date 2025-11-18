import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  const usersMock = {
    findByUsername: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    verifyEmail: jest.fn(),
    findByEmailVerifyToken: jest.fn(),
  } as Partial<UsersService>;

  const jwtMock = {
    sign: jest.fn().mockReturnValue('token123'),
  } as Partial<JwtService>;

  const emailMock = {
    sendVerificationEmail: jest.fn(),
  } as Partial<EmailService>;

  const prismaMock = {
    user: { update: jest.fn() } as unknown as PrismaService['user'],
  } as Partial<PrismaService>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersMock },
        { provide: JwtService, useValue: jwtMock },
        { provide: EmailService, useValue: emailMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('login should throw BadRequest when usernameOrEmail missing', async () => {
    await expect(
      service.login({ usernameOrEmail: '', password: 'secret' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('login should return token for valid credentials', async () => {
    const hashed = await bcrypt.hash('secret', 10);
    (usersMock.findByUsername as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'e@example.com',
      username: 'yasmin',
      password: hashed,
    });

    const token = await service.login({
      usernameOrEmail: 'yasmin',
      password: 'secret',
    } as any);

    expect(token).toBe('token123');
    expect(usersMock.findByUsername).toHaveBeenCalledWith('yasmin');
    expect(jwtMock.sign).toHaveBeenCalled();
  });

  it('login should throw Unauthorized on invalid password', async () => {
    const hashed = await bcrypt.hash('notsecret', 10);
    (usersMock.findByEmail as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'email@example.com',
      username: 'yasmin',
      password: hashed,
    });

    await expect(
      service.login({
        usernameOrEmail: 'email@example.com',
        password: 'secret',
      } as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
