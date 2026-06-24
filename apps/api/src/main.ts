import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  app.setGlobalPrefix('api/v1');

  // Input validation and sanitization
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        console.error('Validation errors:', JSON.stringify(errors, null, 2));
        const messages = errors.map((error) => Object.values(error.constraints || {})).flat();
        const { BadRequestException } = require('@nestjs/common');
        return new BadRequestException(messages);
      },
    }),
  );

  // CORS - whitelist only allowed origins
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [process.env.FRONTEND_URL || 'http://localhost:3000'];
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || 
          allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, ''))) ||
          origin.includes('localhost') || 
          origin.endsWith('.vercel.app')) {
        callback(null, origin || true);
      } else {
        console.error(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger docs (disabled in production)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('WFGTS API')
      .setDescription('Wedding Financial & Gift Tracking System API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`WFGTS API running on port ${port}`);
}
bootstrap();