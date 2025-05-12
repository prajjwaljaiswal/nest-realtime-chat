import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import moment from 'moment';
import express from 'express';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { translateErrors } from '@common/global-exceptions-filter/transform-errors';
import { AllExceptionsFilter } from '@common/global-exceptions-filter/all-exceptions.filter';
import { useContainer } from 'class-validator';
import { setupSwagger } from '@common/configs/swagger.config';
import { create } from 'express-handlebars';
import { TransformInterceptor } from '@common/global-interceptors/transform.interceptors';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('v1/api');
  moment.tz.setDefault('Asia/Kolkata');
  app.use('/public', express.static(join(__dirname, '..', 'public')));
  app.enableCors({
    credentials: true,
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.use(cookieParser());
  // app.use(express.json());

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // app.use(passport.initialize());
  // app.use(passport.session());
  app.useStaticAssets(join(__dirname, '..', '..', 'src', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', '..', 'src', 'views'));
  // app.use(csurf());
  app.useGlobalPipes(
    new ValidationPipe({
      skipMissingProperties: false,
      transform: true,
      validationError: {
        target: false,
      },
      exceptionFactory: translateErrors,
      forbidUnknownValues: false,
    })
  );

  app.use((req, res, next) => {
    console.log('Incoming Request:', {
      method: req.method,
      url: req.url,
      body: req.body,
      files: req.files, // Verify files
    });
    next();
  });

  // app.useGlobalInterceptors(new ErrorsInterceptor());
  // Custom exceptions filter
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  // Apply the interceptor globally
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.enableShutdownHooks();
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  setupSwagger(app);
  // Create `ExpressHandlebars` instance with a default layout.
  const hbs = create({
    extname: 'hbs',
    defaultLayout: 'layout_main',
    layoutsDir: join(__dirname, '..', '..', 'src', 'views', 'layouts'),
    partialsDir: join(__dirname, '..', '..', 'src', 'views', 'partials'),
    // helpers: { printName },
  });
  app.engine('hbs', hbs.engine);

  app.setViewEngine('hbs');
  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
