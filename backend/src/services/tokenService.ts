import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '../middleware/auth';

export interface TokenPayload {
  id: number;
  role: Role;
}

export function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.accessTtlSec });
}

export function signRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshTtlSec });
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.jwt.refreshSecret) as TokenPayload;
  } catch {
    return null;
  }
}
