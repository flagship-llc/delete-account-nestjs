import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopSchema } from './schemas/shop.schema';
import { ConfigService } from '@nestjs/config';
import { ShopifyWebhookMiddleware } from './middleware/webhook.middleware';
import { getScopes } from './helpers/scopeHelper';
import Shopify from '@shopify/shopify-api';
import { ShopifyController } from './controllers/shopify.controller';
import { ShopService } from './services/shop.service';
import { Session } from '@shopify/shopify-api/dist/auth/session';
import { ShopDTO } from './dto/shop.dto';
import { CustomerService } from './services/api/customer.service';
import { WebhooksService } from '../services/webhooks.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Shop',
        schema: ShopSchema,
      },
    ]),
  ],
  controllers: [ShopifyController],
  providers: [
    ShopService,
    ConfigService,
    ShopifyWebhookMiddleware,
    CustomerService,
    WebhooksService,
  ],
  exports: [ShopService, ShopifyWebhookMiddleware, CustomerService],
})
export class ShopifyModule {
  constructor(
    private readonly configService: ConfigService,
    private readonly shopService: ShopService,
  ) {
    const storeCallback = async (session: Session): Promise<boolean> => {
      await this.shopService.addOrUpdate(session as ShopDTO);
      return true;
    };

    const loadCallback = async (id: string): Promise<Session> => {
      const shop = await this.shopService.getById(id);
      const session = new Session(shop.id);
      session.accessToken = shop.accessToken;
      session.expires = shop.expires;
      session.isOnline = shop.isOnline;
      session.scope = shop.scope;
      session.shop = shop.shop;
      session.state = shop.state;
      return session;
    };

    const deleteCallback = async (id: string): Promise<boolean> => {
      await this.shopService.deleteById(id);
      return true;
    };

    const mongooseSession = new Shopify.Session.CustomSessionStorage(
      storeCallback,
      loadCallback,
      deleteCallback,
    );

    Shopify.Context.initialize({
      API_KEY: this.configService.get('shopifyApiKey'),
      API_SECRET_KEY: this.configService.get('shopifySecretKey'),
      SCOPES: [getScopes()],
      HOST_NAME: this.configService.get('appDomain'),
      IS_EMBEDDED_APP: this.configService.get<boolean>('isEmbedded'),
      API_VERSION: this.configService.get('shopifyApiVersion'),
      SESSION_STORAGE: mongooseSession,
    });
  }
}
