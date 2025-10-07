import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type Role = 'requester' | 'hod' | 'pm' | 'store' | 'admin';

export interface AuthUser {
  id: number;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, env.jwt.secret) as AuthUser & { exp: number };
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function authorize(roles: Role[] | 'self' | 'admin_or_self') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const user = req.user;
    if (roles === 'self') {
      const targetId = Number(req.params.id);
      if (user.id === targetId) return next();
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (roles === 'admin_or_self') {
      const targetId = Number(req.params.id);
      if (user.role === 'admin' || user.id === targetId) return next();
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (Array.isArray(roles)) {
      if (roles.includes(user.role)) return next();
      return res.status(403).json({ error: 'Forbidden' });
    }
    return res.status(403).json({ error: 'Forbidden' });
  };
}
