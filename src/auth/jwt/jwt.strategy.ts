import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';

const extractJwtFromCookie = (req: Request) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['auth_token'];
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: extractJwtFromCookie,
      secretOrKey: process.env.JWT_SECRET || 'supersecretkey',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // if (!user.emailVerified) {
    //   throw new UnauthorizedException(
    //     'Please verify your email before accessing this resource',
    //   );
    // }

    return {
      id: user.id,
      userId: user.id,
      email: user.email,
      username: user.username,
      emailVerified: user.emailVerified,
    };
  }
}
