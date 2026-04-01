import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../shared/database.js';
import { config } from '../../shared/config.js';
import { ConflictError, UnauthorizedError } from '../../shared/errors.js';
import type { JwtPayload, SafeUser } from '../../shared/types.js';
import type { SignUpInput, SignInInput } from './auth.schemas.js';

const SALT_ROUNDS = 12;

interface AuthResult {
  readonly user: SafeUser;
  readonly token: string;
}

const generateToken = (user: SafeUser): string => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
  };
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

const toSafeUser = (user: Pick<SafeUser, 'id' | 'email' | 'createdAt' | 'updatedAt'>): SafeUser => ({
  id: user.id,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const authService = {
  async signUp(input: SignUpInput): Promise<AuthResult> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const safeUser = toSafeUser(user);
    const token = generateToken(safeUser);

    return { user: safeUser, token };
  },

  async signIn(input: SignInInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const safeUser = toSafeUser(user);
    const token = generateToken(safeUser);

    return { user: safeUser, token };
  },

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as JwtPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  },
} as const;
