import { JwtService } from '@nestjs/jwt';
import { Request, CookieOptions } from 'express';
import { randomUUID } from 'node:crypto';

export const TOKEN_COOKIE = 'sewaskill.token';
export const TOKEN_ALGORITHM = 'HS256';
export const TOKEN_ISSUER = 'sewaskill';
export const TOKEN_AUDIENCE = 'sewaskill-app';

export interface TokenPayload {
  sub: string;
  ver: number;
  jti: string;
  exp: number;
}

export function tokenDays() {
  const days = Number(process.env.SESSION_DAYS || 7);
  if (!Number.isFinite(days) || days < 1 || days > 30) {
    throw new Error('SESSION_DAYS must be between 1 and 30');
  }
  return days;
}

export function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: tokenDays() * 86400000,
  };
}

export function readCookie(request: Request, name: string) {
  const header = request.headers.cookie;
  if (!header) {
    return undefined;
  }
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) {
      continue;
    }
    if (part.slice(0, index).trim() === name) {
      try {
        return decodeURIComponent(part.slice(index + 1).trim());
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

export function readBearer(request: Request) {
  const header = request.get('authorization') || '';
  const match = header.match(/^Bearer ([A-Za-z0-9._-]+)$/);
  if (match) {
    return match[1];
  }
  return undefined;
}

export function readToken(request: Request) {
  return readCookie(request, TOKEN_COOKIE) || readBearer(request);
}

export function usesBearerOnly(request: Request) {
  return !readCookie(request, TOKEN_COOKIE) && Boolean(readBearer(request));
}

export async function issueToken(jwt: JwtService, userId: string, sessionVersion: number) {
  return jwt.signAsync(
    { sub: userId, ver: sessionVersion },
    {
      algorithm: TOKEN_ALGORITHM,
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
      jwtid: randomUUID(),
      expiresIn: tokenDays() * 86400,
    },
  );
}
