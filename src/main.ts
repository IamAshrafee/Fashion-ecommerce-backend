import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import helmet from 'helmet';
import { AppModule } from './app.module';
import {
  GlobalExceptionFilter,
  ResponseTransformInterceptor,
} from './common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // ============================================
  // GLOBAL PREFIX
  // ============================================
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);

  // ============================================
  // SECURITY: HELMET (HTTP Headers)
  // ============================================
  app.use(helmet());

  // ============================================
  // CORS CONFIGURATION
  // ============================================
  const clientUrl = configService.get<string>('CLIENT_URL', 'http://localhost:5173');
  app.enableCors({
    origin: clientUrl,
    credentials: true,
  });

  // ============================================
  // GLOBAL EXCEPTION FILTER
  // Ensures ALL responses (even 500 errors) follow
  // { success: boolean, data?: any, error?: string }
  // ============================================
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ============================================
  // GLOBAL RESPONSE INTERCEPTOR
  // Automatically wraps success responses in standard format
  // ============================================
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  // ============================================
  // VALIDATION PIPE (Using Zod via nestjs-zod)
  // Validates all DTOs created with createZodDto()
  // ============================================
  app.useGlobalPipes(new ZodValidationPipe());

  // ============================================
  // SWAGGER / OPENAPI DOCUMENTATION
  // ============================================
  const swaggerEnabled = configService.get<string>('SWAGGER_ENABLED', 'true') === 'true';

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(configService.get<string>('SWAGGER_TITLE', 'The Fashion Engine API'))
      .setDescription(
        configService.get<string>(
          'SWAGGER_DESCRIPTION',
          'Universal E-commerce Backend for Fashion & Apparel',
        ),
      )
      .setVersion(configService.get<string>('SWAGGER_VERSION', '1.0'))
      .addTag('health', 'Health check endpoints')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    const swaggerPath = configService.get<string>('SWAGGER_PATH', 'api/docs');
    SwaggerModule.setup(swaggerPath, app, document, {
      customSiteTitle: 'Fashion Engine API',
      customfavIcon: 'https://nestjs.com/img/logo_text.svg',
      customCss: '.swagger-ui .topbar { display: none }',
    });

    console.log(`📚 Swagger Documentation: http://localhost:${configService.get<number>('PORT', 3000)}/${swaggerPath}`);
  }

  // ============================================
  // START SERVER
  // ============================================
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 The Fashion Engine is running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`🌍 Environment: ${configService.get<string>('NODE_ENV', 'development')}`);
}

bootstrap();
