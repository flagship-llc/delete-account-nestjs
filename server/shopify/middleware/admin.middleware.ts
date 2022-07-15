import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response } from 'express';
import { AdminRequest } from '../interface/request.interface';
import Shopify from '@shopify/shopify-api';

@Injectable()
export class ShopifyAdminMiddleware implements NestMiddleware {
  constructor() {}
  async use(req: AdminRequest, res: Response, next: () => void) {
    const params = req.query;
    if (!params.session && params.shop && params.hmac && params.timestamp) {
      const authRoute = await Shopify.Auth.beginAuth(
        req,
        res,
        params.shop.toString(),
        '/shopify/auth/callback',
        false,
      );
      res.writeHead(302, { Location: authRoute });
      res.end();
    } else {
      req.session = await Shopify.Utils.loadCurrentSession(req, res, false);
      next();
    }
  }
}
