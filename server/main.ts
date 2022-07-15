import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'body-parser';
import cloneBuffer from 'clone-buffer';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  app.setBaseViewsDir([
    join(__dirname, '..', 'client', 'admin', 'views'),
    join(__dirname, '..', 'client', 'theme', 'views'),
  ]);

  app.setViewEngine('hbs');

  app.use(
    json({
      verify: (req: any, res: any, buf, encoding) => {
        if (req.headers['x-shopify-hmac-sha256'] && Buffer.isBuffer(buf)) {
          req.rawBody = cloneBuffer(buf);
        }
        return true;
      },
    }),
  );

  await app.listen(configService.get<number>('port') || 5000);
}

bootstrap();
