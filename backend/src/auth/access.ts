import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { DatabaseService } from '../database/database.service';
import { fail } from '../common/domain';
import { TOKEN_ALGORITHM, TOKEN_AUDIENCE, TOKEN_ISSUER, TokenPayload, readToken } from './tokens';

declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
  }
}
export interface AuthRequest extends Request {
  user: User;
  authToken?: { jti: string; expiresAt: Date };
}
export const Public = () => SetMetadata('public', true);
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    private readonly database: DatabaseService,
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}
  private async authenticate(request: AuthRequest, token: string) {
    let payload: TokenPayload;
    try {
      payload = await this.jwt.verifyAsync<TokenPayload>(token, {
        algorithms: [TOKEN_ALGORITHM],
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE,
      });
    } catch {
      return;
    }
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.jti !== 'string' ||
      !Number.isInteger(payload.ver) ||
      !Number.isInteger(payload.exp)
    ) {
      return;
    }
    const [user, revoked] = await Promise.all([
      this.database.user.findUnique({ where: { id: payload.sub } }),
      this.database.revokedToken.findUnique({ where: { jti: payload.jti } }),
    ]);
    if (
      !user ||
      revoked ||
      user.deletedAt ||
      user.status !== 'aktif' ||
      user.sessionVersion !== payload.ver
    ) {
      return;
    }
    request.user = user;
    request.authToken = { jti: payload.jti, expiresAt: new Date(payload.exp * 1000) };
  }
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const isPublic = this.reflector.getAllAndOverride<boolean>('public', [
      context.getHandler(),
      context.getClass(),
    ]);
    const token = readToken(request);
    if (token) {
      await this.authenticate(request, token);
    }
    if (!request.user && !isPublic) {
      fail('Masuk terlebih dahulu.', 'UNAUTHENTICATED', 401);
    }
    const roles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (roles && (!request.user || !roles.includes(request.user.role))) {
      fail('Akses tidak diizinkan.', 'FORBIDDEN', 403);
    }
    return true;
  }
}
