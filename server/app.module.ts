import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ShopifyModule } from './shopify/shopify.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import configuration from './configuration/configuration';
import { AppController } from './controllers/app.controller';
import { WebhooksController } from './controllers/webhook.controller';
import { ProxyController } from './controllers/proxy.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopifyWebhookMiddleware } from './shopify/middleware/webhook.middleware';
import { ShopifyProxyMiddleware } from './shopify/middleware/proxy.middleware';
import { join } from 'path';
import { ShopifyAdminMiddleware } from './shopify/middleware/admin.middleware';
import { SentryModule, SentryInterceptor } from '@ntegral/nestjs-sentry';
import { AdminController } from './controllers/admin.controller';

@Module({
  imports: [
    ShopifyModule,
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('dbUri'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '..', 'client', 'admin'),
        renderPath: '/',
      },
    ),
  ],
  controllers: [
    AppController,
    WebhooksController,
    ProxyController,
    AdminController,
  ],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useValue: new SentryInterceptor(),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ShopifyWebhookMiddleware).forRoutes(WebhooksController);
    consumer.apply(ShopifyProxyMiddleware).forRoutes(ProxyController);
    consumer
      .apply(ShopifyAdminMiddleware)
      .forRoutes(AdminController, AppController);
  }
}
