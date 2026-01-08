import type { User } from '@prisma/client';

export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string;
}

export interface JwtPayload {
  readonly userId: string;
  readonly email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export type SafeUser = Omit<User, 'passwordHash'>;
