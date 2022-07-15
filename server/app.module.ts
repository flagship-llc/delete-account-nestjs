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
import { LogLevel } from '@sentry/types';
import { AdminController } from './controllers/admin.controller';

@Module({
  imports: [
    SentryModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dsn: configService.get<string>('sentryDsn'),
        debug:
          configService.get<string>('environment') == 'dev' ||
          configService.get<string>('environment') == 'staging',
        environment: configService.get<string>('environment'),
        release: null,
        logLevel:
          configService.get<string>('environment') == 'dev'
            ? LogLevel.Debug
            : configService.get<string>('environment') == 'staging'
            ? LogLevel.Debug
            : LogLevel.Verbose,
      }),
      inject: [ConfigService],
    }),
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
      {
        rootPath: join(__dirname, '..', 'client', 'theme'),
        renderPath: '/proxy',
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
