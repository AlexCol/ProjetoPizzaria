import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { IsPublic } from 'src/guards/isPublic';

@Controller({ path: 'app' })
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get("hello")
  getHello(): string {
    return this.appService.getHello();
  }

  @IsPublic()
  @Get("public")
  getPublic(): string {
    return this.appService.getPublic();
  }
}
