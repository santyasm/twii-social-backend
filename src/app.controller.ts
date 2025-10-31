import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHome(@Res() res) {
    const html = this.appService.getHomeHtml();
    res.type('html').send(html);
  }
}
