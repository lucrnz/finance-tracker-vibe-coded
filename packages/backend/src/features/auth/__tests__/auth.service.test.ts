import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authService } from '../auth.service.js';
import { prisma } from '../../../shared/database.js';
import { ConflictError, UnauthorizedError } from '../../../shared/errors.js';
import type { JwtPayload } from '../../../shared/types.js';

const prismaMock = prisma as unknown as {
  user: {
    findUnique: Mock;
    create: Mock;
  };
};

const bcryptMock = bcrypt as unknown as {
  hash: Mock;
  compare: Mock;
};

const jwtMock = jwt as unknown as {
  sign: Mock;
  verify: Mock;
};

describe('authService', () => {
  const baseUser = {
    id: 'user-1',
    email: 'user@example.com',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws ConflictError when email already exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash: 'hash' });

    await expect(authService.signUp({ email: baseUser.email, password: 'password' })).rejects.toBeInstanceOf(
      ConflictError
    );
  });

  it('creates a user and returns a token on signUp', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    bcryptMock.hash.mockResolvedValue('hashed-password');
    prismaMock.user.create.mockResolvedValue(baseUser);
    jwtMock.sign.mockReturnValue('signed-token');

    const result = await authService.signUp({
      email: baseUser.email,
      password: 'password123',
    });

    expect(bcryptMock.hash).toHaveBeenCalledWith('password123', expect.any(Number));
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ passwordHash: 'hashed-password' }),
      })
    );
    expect(result).toEqual({
      user: baseUser,
      token: 'signed-token',
    });
  });

  it('throws UnauthorizedError on signIn when user is missing', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(authService.signIn({ email: baseUser.email, password: 'password' })).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });

  it('throws UnauthorizedError on signIn when password is invalid', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash: 'hash' });
    bcryptMock.compare.mockResolvedValue(false);

    await expect(authService.signIn({ email: baseUser.email, password: 'bad' })).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });

  it('returns user and token on signIn', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash: 'hash' });
    bcryptMock.compare.mockResolvedValue(true);
    jwtMock.sign.mockReturnValue('signed-token');

    const result = await authService.signIn({ email: baseUser.email, password: 'password' });

    expect(bcryptMock.compare).toHaveBeenCalledWith('password', 'hash');
    expect(result).toEqual({
      user: baseUser,
      token: 'signed-token',
    });
  });

  it('verifies tokens and returns payload', () => {
    const payload: JwtPayload = { userId: baseUser.id, email: baseUser.email };
    jwtMock.verify.mockReturnValue(payload);

    expect(authService.verifyToken('token')).toEqual(payload);
  });

  it('throws UnauthorizedError when token is invalid', () => {
    jwtMock.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    expect(() => authService.verifyToken('token')).toThrow(UnauthorizedError);
  });
});
