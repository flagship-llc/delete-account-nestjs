import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { createHmac } from "crypto";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ShopifyWebhookMiddleware implements NestMiddleware {
    constructor(private readonly configService: ConfigService) { }
    async use(req: Request, res: Response, next: () => void) {
        if (!req.headers["x-shopify-hmac-sha256"]) {
            throw new HttpException({ status: 'FORBIDDEN', error: "Invalid signature" }, HttpStatus.FORBIDDEN);
        }
        const hmac = req.headers["x-shopify-hmac-sha256"].toString();
        const data = (req as any).rawBody;
        const signature = this.configService.get<string>('shopifySecretKey');
        const calculated_hash = createHmac("sha256", signature)
            .update(data)
            .digest("base64");

        if (!req.headers || hmac !== calculated_hash) {
            throw new HttpException({ status: 'FORBIDDEN', error: "Invalid signature" }, HttpStatus.FORBIDDEN);
        }

        next();
    }
}