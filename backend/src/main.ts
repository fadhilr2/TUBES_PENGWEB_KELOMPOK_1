import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, static as serveStatic, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';
import { storageDirectory } from './media/media.controller';
import { AppModule } from './app.module';
import { ApiExceptionFilter, ResponseInterceptor } from './common/http';
import {
  authAccountLimit,
  authIpLimit,
  csrfSynchronisedProtection,
  uploadLimit,
} from './common/security';
import { usesBearerOnly } from './auth/tokens';

export async function createApp() {
  if (
    !process.env.DATABASE_URL ||
    !process.env.SESSION_SECRET ||
    process.env.SESSION_SECRET.length < 32 ||
    process.env.SESSION_SECRET.startsWith('replace-')
  ) {
    throw new Error('Configure DATABASE_URL and a random SESSION_SECRET in backend/.env');
  }
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32 ||
    process.env.JWT_SECRET.startsWith('replace-') ||
    process.env.JWT_SECRET === process.env.SESSION_SECRET
  ) {
    throw new Error(
      'Configure a random JWT_SECRET (32+ characters, different from SESSION_SECRET)',
    );
  }
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    logger: ['error', 'warn', 'log'],
  });
  if (process.env.NODE_ENV === 'production') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }
  app.use(
    '/uploads',
    serveStatic(storageDirectory(), {
      dotfiles: 'deny',
      fallthrough: false,
      index: false,
      setHeaders: (response) => {
        response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        response.setHeader('X-Content-Type-Options', 'nosniff');
      },
    }),
  );
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const PgStore = connectPgSimple(session);
  const store = new PgStore({ pool, createTableIfMissing: false });
  const days = Number(process.env.SESSION_DAYS || 7);
  if (!Number.isFinite(days) || days < 1 || days > 30) {
    throw new Error('SESSION_DAYS must be between 1 and 30');
  }
  const origins = (
    process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173'
  ).split(',');
  origins.push(
    `http://localhost:${process.env.PORT || 3001}`,
    `http://127.0.0.1:${process.env.PORT || 3001}`,
  );
  app.enableCors({ origin: origins, credentials: true });
  app.use(
    helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false }),
  );
  app.use((request: Request, response: Response, next: NextFunction) => {
    response.setHeader('X-Request-Id', randomUUID());
    response.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.use(json({ limit: '128kb' }));
  app.use(
    session({
      name: 'sewaskill.sid',
      secret: process.env.SESSION_SECRET,
      store,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: days * 86400000,
      },
    }),
  );
  app.use(['/api/v1/auth/login', '/api/v1/auth/register'], authIpLimit, authAccountLimit);
  app.use('/api/v1/media/images', uploadLimit);
  app.use((request: Request, response: Response, next: NextFunction) => {
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(request.method) &&
      request.path !== '/api/v1/payments/midtrans/notification' &&
      Boolean(request.get('origin')) &&
      !origins.includes(request.get('origin') || '')
    ) {
      return response.status(403).json({
        error: { code: 'ORIGIN_REJECTED', message: 'Origin tidak diizinkan.', fields: {} },
        requestId: response.getHeader('X-Request-Id'),
      });
    }
    next();
  });
  app.use((request: Request, response: Response, next: NextFunction) => {
    if (request.method === 'POST' && request.path === '/api/v1/payments/midtrans/notification') {
      return next();
    }
    if (usesBearerOnly(request)) {
      return next();
    }
    csrfSynchronisedProtection(request, response, next);
  });
  app.use(
    (
      error: { code?: string; status?: number },
      request: Request,
      response: Response,
      next: NextFunction,
    ) => {
      if (error) {
        return response.status(error.code === 'EBADCSRFTOKEN' ? 403 : error.status || 500).json({
          error: {
            code: error.code === 'EBADCSRFTOKEN' ? 'CSRF_REJECTED' : 'REQUEST_REJECTED',
            message:
              error.code === 'EBADCSRFTOKEN'
                ? 'Sesi formulir tidak valid. Muat ulang halaman.'
                : 'Request tidak dapat diproses.',
            fields: {},
          },
          requestId: response.getHeader('X-Request-Id'),
        });
      }
      next();
    },
  );
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new ApiExceptionFilter());
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('SewaSkill API')
      .setDescription(
        'Demo marketplace API. Cookie clients: initialize CSRF, log in, and supply X-CSRF-Token for mutations. Bearer clients: log in with header X-Auth-Mode: bearer and send Authorization: Bearer <token>; no CSRF token is needed.',
      )
      .setVersion('1.0.0')
      .addCookieAuth('sewaskill.token')
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', in: 'header', name: 'X-CSRF-Token' }, 'csrf')
      .addSecurityRequirements('csrf')
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  }
  app.enableShutdownHooks();
  const close = app.close.bind(app);
  app.close = async () => {
    await close();
    await pool.end();
  };
  return app;
}

async function bootstrap() {
  try {
    const app = await createApp();
    const port = Number(process.env.PORT || 3001);
    await app.listen(port, '127.0.0.1');
  } catch (error) {
    let message = 'Startup failed';
    if (error instanceof Error) {
      message = error.message;
    }
    console.error(message);
    process.exit(1);
  }
}

if (require.main === module) {
  bootstrap();
}
