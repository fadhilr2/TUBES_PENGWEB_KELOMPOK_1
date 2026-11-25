import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { hash, verify } from 'argon2';
import { User } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { LoginDto, RegisterDto } from '../common/dto';
import { entry, fail, log, privateUser } from '../common/domain';
import { AuthRequest, Public } from './access';
import { generateToken } from '../common/security';
import { TOKEN_COOKIE, cookieOptions, issueToken } from './tokens';

const timingEqualizer = hash('sewaskill-timing-equalizer');

function replaceSession(request: AuthRequest) {
  return new Promise<void>((resolve, reject) => {
    request.session.regenerate((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function destroySession(request: AuthRequest) {
  return new Promise<void>((resolve, reject) => {
    request.session.destroy((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly database: DatabaseService,
    private readonly jwt: JwtService,
  ) {}

  private async startSession(
    request: AuthRequest,
    response: Response,
    user: User,
  ): Promise<ReturnType<typeof privateUser> & { token?: string }> {
    await replaceSession(request);
    const token = await issueToken(this.jwt, user.id, user.sessionVersion);
    response.cookie(TOKEN_COOKIE, token, cookieOptions());
    const profile = privateUser(user);
    if (request.get('x-auth-mode') === 'bearer') {
      return { ...profile, token };
    }
    return profile;
  }

  @Public()
  @Get('csrf')
  csrf(@Req() request: AuthRequest) {
    return { token: generateToken(request) };
  }

  @Public()
  @Post('register')
  async register(
    @Body() body: RegisterDto,
    @Req() request: AuthRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const passwordHash = await hash(body.password);
    const user = await this.database.transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          name: body.name,
          email: body.email.toLowerCase(),
          location: body.location,
          passwordHash,
        },
      });
      await entry(transaction, user.id, user.balance, 'opening', `opening:${user.id}`);
      await log(transaction, user.id, 'register', `${user.name} membuat akun pencari.`);
      return user;
    });
    return this.startSession(request, response, user);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: LoginDto,
    @Req() request: AuthRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.database.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });
    const knownAccount = Boolean(user && !user.deletedAt);
    const passwordHash = knownAccount ? user!.passwordHash : await timingEqualizer;
    const passwordOk = await verify(passwordHash, body.password);
    if (!user || !knownAccount || !passwordOk) {
      fail('Email atau password salah.', 'INVALID_CREDENTIALS', 401);
    }
    if (user.status !== 'aktif') {
      fail('Akun Anda diblokir.', 'ACCOUNT_BLOCKED', 403);
    }
    await this.database.transaction((transaction) =>
      log(transaction, user.id, 'login', `${user.name} masuk sebagai ${user.role}.`),
    );
    return this.startSession(request, response, user);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) {
    const { jti, expiresAt } = request.authToken!;
    await this.database.transaction(async (transaction) => {
      await log(transaction, request.user.id, 'logout', `${request.user.name} keluar.`);
      await transaction.revokedToken.upsert({
        where: { jti },
        create: { jti, expiresAt },
        update: {},
      });
      await transaction.revokedToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    });
    await destroySession(request);
    const { maxAge, ...clearing } = cookieOptions();
    void maxAge;
    response.clearCookie(TOKEN_COOKIE, clearing);
    response.clearCookie('sewaskill.sid', clearing);
    return { success: true };
  }

  @Get('me') me(@Req() request: AuthRequest) {
    return privateUser(request.user);
  }
}
