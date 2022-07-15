import { Controller, Get, Query } from '@nestjs/common';

@Controller('proxy')
export class ProxyController {
  @Get()
  async getProxyRoute(@Query('shop') shop: string) {
    console.log(shop); // the shop the proxy request came from
  }
}
