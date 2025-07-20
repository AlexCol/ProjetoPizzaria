import { BadRequestException, Controller, Get, MisdirectedException, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('error')
  getError(): string {
    throw new MisdirectedException('This is a forced error');
  }
}