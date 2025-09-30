import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { username?: string; email?: string; password: string },
  ) {
    return this.authService.login(body);
  }

  @Post('register')
  async register(
    @Body()
    body: {
      name: string;
      username: string;
      email: string;
      password: string;
    },
  ) {
    return this.authService.register(body);
  }
}
