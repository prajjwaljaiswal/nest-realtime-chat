import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from '@common/decorators/roles.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Post('flw-webhook')
  async getPaymentWebhook(@Body() payload: any) {
    //console.log(`app.controller-17`, payload);
  }
}
