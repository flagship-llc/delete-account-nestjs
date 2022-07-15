import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ShopifyProxyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  async use(req: Request, res: Response, next: () => void) {
    const params = req.query;
    const signature = params.signature;
    delete params.signature;

    const sorted_params = Object.keys(params)
      .map((k) => `${k}=${params[k]}`)
      .sort()
      .join('');
    const shared_secret = this.configService.get<string>('shopifySecretKey');

    const calculated_hash = createHmac('sha256', shared_secret)
      .update(sorted_params)
      .digest('hex');

    if (!req.headers || signature !== calculated_hash) {
      throw new HttpException(
        { status: 'FORBIDDEN', error: 'Invalid signature' },
        HttpStatus.FORBIDDEN,
      );
    }

    next();
  }
}
