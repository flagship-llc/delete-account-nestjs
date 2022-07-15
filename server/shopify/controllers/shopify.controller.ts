import { Controller, Get, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import Shopify, { AuthQuery } from '@shopify/shopify-api';
import { ShopDTO } from '../dto/shop.dto';
import { ShopService } from '../services/shop.service';
import { ConfigService } from '@nestjs/config';
import { WebhooksService } from '../../services/webhooks.service';
import { getWebhooks } from '../helpers/webhookHelper';

@Controller('shopify')
export class ShopifyController {
  logger: Logger;
  constructor(
    private readonly shopService: ShopService,
    private readonly configService: ConfigService,
    private readonly webhookService: WebhooksService,
  ) {
    this.logger = new Logger('Shopify Controller');
  }

  @Get()
  async install(@Req() request: Request, @Res() response: Response) {
    const shop = request.query.shop;
    const authRoute = await Shopify.Auth.beginAuth(
      request,
      response,
      shop.toString(),
      '/shopify/auth/callback',
      false,
    );
    response.writeHead(302, { Location: authRoute });
    response.end();
  }

  @Get('auth/callback')
  async callback(@Req() request: Request, @Res() response: Response) {
    await Shopify.Auth.validateAuthCallback(
      request,
      response,
      request.query as unknown as AuthQuery,
    );
    const currentSession = await Shopify.Utils.loadCurrentSession(
      request,
      response,
      false,
    );

    await this.shopService.addOrUpdate(currentSession as ShopDTO);

    const webhooksObj = getWebhooks();
    const webhookKeys = Object.keys(webhooksObj).filter((k) => webhooksObj[k]);

    for (let j = 0; j < webhookKeys.length; j++) {
      const topic = webhookKeys[j];
      const url = webhooksObj[topic];

      await Shopify.Webhooks.Registry.register({
        path: `/webhooks/${url}`,
        topic: topic.toUpperCase(),
        accessToken: currentSession.accessToken,
        shop: currentSession.shop,
        webhookHandler: this.webhookService.handleWebhookRequest,
      });
    }

    return response.redirect(
      `https://${
        currentSession.shop
      }/admin/apps/${this.configService.get<string>('shopifyApiKey')}`,
    );
  }
}
