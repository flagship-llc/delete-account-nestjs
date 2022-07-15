import { Body, Post, Controller, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ShopService } from '../shopify/services/shop.service';
import { ShopDTO } from '../shopify/dto/shop.dto';
import Shopify from '@shopify/shopify-api';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly shopService: ShopService) {}

  @Post('customer-deleted')
  async handleWebhook(@Req() request: Request, @Res() response: Response) {
    // This will use the handler specified when registering webhooks with @Shopify-api
    // It will automatically return a 200 whether an error ocurrs
    await Shopify.Webhooks.Registry.process(request, response);
  }

  // @Post('uninstalled')
  // async appUninstalled(@Body() body): Promise<void> {
  //     const shopDTO = new ShopDTO();
  //     shopDTO.shopify_domain = body.domain;
  //     await this.shopService.deleteByDomain(shopDTO);
  // }
}
