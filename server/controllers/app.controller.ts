import { Controller, Render, Get, Req, Res, Query } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @Render('index')
  async index(
    @Req() request: Request,
    @Res() response: Response,
    @Query('host') host: string,
  ) {
    const apiKey = this.configService.get('shopifyApiKey');
    const appDomain = this.configService.get('appDomain');
    return { apiKey, shop: request.query.shop, appDomain, host };
  }
}
