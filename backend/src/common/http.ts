import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { map } from 'rxjs';

function jsonSafe(value: unknown): unknown {
  return JSON.parse(
    JSON.stringify(value, (_, field) => {
      if (typeof field !== 'bigint') {
        return field;
      }
      const result = Number(field);
      if (!Number.isSafeInteger(result)) {
        throw new Error('Unsafe currency value');
      }
      return result;
    }),
  );
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next
      .handle()
      .pipe(
        map((value) =>
          jsonSafe(value && Object.hasOwn(value, 'meta') ? value : { data: value ?? null }),
        ),
      );
  }
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    let status = 500;
    let code = 'INTERNAL_ERROR';
    let message = 'Layanan sedang bermasalah. Coba lagi.';
    let fields: unknown = {};
    if (error instanceof HttpException) {
      status = error.getStatus();
      const body = error.getResponse() as { code?: string; message?: string | string[] };
      code =
        body.code ||
        (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INVALID_REQUEST');
      if (Array.isArray(body.message)) {
        fields = body.message;
        message = 'Periksa data yang dikirim.';
      } else {
        message = typeof body === 'string' ? body : body.message || error.message;
      }
    } else if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      ['P2002', 'P2034'].includes(error.code)
    ) {
      status = 409;
      code = 'DATA_CONFLICT';
      message =
        error.code === 'P2002' ? 'Data sudah digunakan.' : 'Data berubah bersamaan. Coba lagi.';
    }
    const requestId = String(response.getHeader('X-Request-Id') || randomUUID());
    if (status === 500) {
      console.error(
        JSON.stringify({
          requestId,
          path: request.path,
          error: error instanceof Error ? error.name : 'UnknownError',
        }),
      );
    }
    response.status(status).json({ error: { code, message, fields }, requestId });
  }
}
