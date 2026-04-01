import { vi } from 'vitest';

process.env['JWT_SECRET'] = process.env['JWT_SECRET'] ?? 'test-secret';

const bcryptHash = vi.fn();
const bcryptCompare = vi.fn();

vi.mock('bcrypt', () => ({
  default: {
    hash: bcryptHash,
    compare: bcryptCompare,
  },
  hash: bcryptHash,
  compare: bcryptCompare,
}));

const jwtSign = vi.fn();
const jwtVerify = vi.fn();

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: jwtSign,
    verify: jwtVerify,
  },
  sign: jwtSign,
  verify: jwtVerify,
}));

vi.mock('../shared/database.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));
