import { csrfSync } from 'csrf-sync';
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const { generateToken, csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (request) => request.get('X-CSRF-Token'),
});
const windowMs = 15 * 60 * 1000;
const error = {
  error: { code: 'RATE_LIMIT', message: 'Terlalu banyak percobaan. Coba lagi nanti.', fields: {} },
};
const handler = (_request: Request, response: Response) =>
  response.status(429).json({ ...error, requestId: response.getHeader('X-Request-Id') });
export const authIpLimit = rateLimit({
  windowMs,
  limit: Number(process.env.AUTH_IP_LIMIT || 300),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler,
});
export const authAccountLimit = rateLimit({
  windowMs,
  limit: Number(process.env.AUTH_ACCOUNT_LIMIT || 30),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (request) =>
    String(request.body?.email || '')
      .trim()
      .toLowerCase()
      .slice(0, 120),
  handler,
});
export const uploadLimit = rateLimit({
  windowMs,
  limit: Number(process.env.UPLOAD_LIMIT || 60),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler,
});
