import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './jwt/jwt.strategy';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    EmailModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '3d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
