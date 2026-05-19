import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { tokenBlacklist } from '../config/tokenBlacklist';
import { UserRole } from '../shared/types/enums';

interface TokenPayload {
  sub?: string;
  role?: UserRole;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: UserRole;
  };
  // token raw para o logout poder adicioná-lo à blacklist
  rawToken?: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'Missing Bearer token' });
  }

  const token = authHeader.slice('Bearer '.length);

  // Verifica se o token foi explicitamente invalidado (logout)
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ ok: false, message: 'Token revogado. Faça login novamente.' });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    if (!payload.sub) {
      return res.status(401).json({ ok: false, message: 'Invalid token payload' });
    }

    req.user = { id: String(payload.sub), role: payload.role };
    req.rawToken = token;

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ ok: false, message: 'Token expirado' });
    }
    return res.status(401).json({ ok: false, message: 'Token inválido' });
  }
}

/** Middleware de autorização por role. Uso: requireRole('SELLER', 'ADMIN') */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: 'Não autenticado' });
    }
    if (!roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ ok: false, message: 'Sem permissão para esta ação' });
    }
    return next();
  };
}