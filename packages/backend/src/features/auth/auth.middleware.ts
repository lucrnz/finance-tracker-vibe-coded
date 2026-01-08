import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../shared/errors.js';
import { authService } from './auth.service.js';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next(new UnauthorizedError('Missing or invalid authorization header'));
    return;
  }

  const token = authHeader.slice(7);

  if (!token) {
    next(new UnauthorizedError('Missing token'));
    return;
  }

  try {
    const payload = authService.verifyToken(token);
    req.user = {
      id: payload.userId,
      email: payload.email,
    };
    next();
  } catch (error) {
    next(error);
  }
};
