# TypeScript Coding Guidelines

This document defines strict TypeScript coding standards for the Finance Tracker application.
These guidelines ensure type safety, reliability, and maintainability across the codebase.

> **For Agents:** These guidelines are mandatory. All code contributions must adhere to these
> standards. When in doubt, choose the stricter option.

## Table of Contents

- [Core Principles](#core-principles)
- [Strict Type Safety](#strict-type-safety)
- [The `readonly` Keyword](#the-readonly-keyword)
- [Avoiding `any`](#avoiding-any)
- [Zod Schema Guidelines](#zod-schema-guidelines)
- [Function Signatures](#function-signatures)
- [Error Handling](#error-handling)
- [Type Inference vs Explicit Types](#type-inference-vs-explicit-types)
- [Utility Types](#utility-types)
- [Examples](#examples)

---

## Core Principles

1. **Type safety is non-negotiable** — Every value must have a known type at compile time.
2. **Immutability by default** — Use `readonly` everywhere possible.
3. **Never use `any`** — Use `unknown` when the type is truly unknown, then narrow it.
4. **Validate at boundaries** — Use Zod schemas for all external data (API, forms, env vars).
5. **Fail fast** — Catch type errors at compile time, not runtime.

---

## Strict Type Safety

### Required TSConfig Settings

Both backend and frontend must enforce these settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### What These Settings Enforce

| Setting | Effect |
|---------|--------|
| `strict` | Enables all strict type-checking options |
| `noUncheckedIndexedAccess` | Array/object index access returns `T \| undefined` |
| `noImplicitReturns` | All code paths must return a value |
| `exactOptionalPropertyTypes` | Distinguishes between `undefined` and missing |
| `noPropertyAccessFromIndexSignature` | Forces bracket notation for index signatures |

---

## The `readonly` Keyword

### Rule: Use `readonly` by Default

All properties, arrays, and objects should be `readonly` unless mutation is explicitly required.

### Object Properties

```typescript
// ✅ CORRECT: Immutable by default
interface User {
  readonly id: string;
  readonly email: string;
  readonly createdAt: Date;
}

// ❌ WRONG: Mutable properties without justification
interface User {
  id: string;
  email: string;
  createdAt: Date;
}
```

### Arrays and Tuples

```typescript
// ✅ CORRECT: Readonly arrays
interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly pagination: {
    readonly page: number;
    readonly total: number;
  };
}

// ✅ CORRECT: Readonly tuple
type Coordinates = readonly [number, number];

// ❌ WRONG: Mutable array
interface PaginatedResult<T> {
  data: T[];
}
```

### Function Parameters

```typescript
// ✅ CORRECT: Readonly parameter
function processItems(items: readonly string[]): number {
  return items.length;
}

// ❌ WRONG: Mutable parameter (allows accidental mutation)
function processItems(items: string[]): number {
  items.push('oops'); // This should not be allowed
  return items.length;
}
```

### Constants and Literals

```typescript
// ✅ CORRECT: Use 'as const' for literal types
const CATEGORIES = ['Food', 'Transport', 'Entertainment'] as const;
type Category = typeof CATEGORIES[number]; // 'Food' | 'Transport' | 'Entertainment'

const config = {
  port: 3000,
  host: 'localhost',
} as const;

// ❌ WRONG: Loses literal type information
const CATEGORIES = ['Food', 'Transport', 'Entertainment']; // string[]
```

### Return Types

```typescript
// ✅ CORRECT: Return readonly objects
function createUser(email: string): Readonly<User> {
  return Object.freeze({ id: generateId(), email, createdAt: new Date() });
}

// ✅ CORRECT: Service objects with 'as const'
export const authService = {
  async signIn(input: SignInInput): Promise<AuthResult> {
    // ...
  },
} as const;
```

---

## Avoiding `any`

### Rule: Never Use `any`

The `any` type defeats the purpose of TypeScript. It disables type checking and propagates
throughout the codebase.

### Use `unknown` Instead

When the type is genuinely unknown, use `unknown` and narrow it:

```typescript
// ✅ CORRECT: Use unknown and narrow
function parseJson(input: string): unknown {
  return JSON.parse(input);
}

function processData(data: unknown): string {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  if (typeof data === 'object' && data !== null && 'message' in data) {
    return String((data as { message: unknown }).message);
  }
  throw new Error('Invalid data format');
}

// ❌ WRONG: Using any
function parseJson(input: string): any {
  return JSON.parse(input);
}
```

### Use Zod for Runtime Validation

When parsing unknown data, always use Zod:

```typescript
// ✅ CORRECT: Validate with Zod
import { z } from 'zod';

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

function parseUser(data: unknown): User {
  return userSchema.parse(data); // Throws if invalid
}

// ✅ CORRECT: Safe parsing
function tryParseUser(data: unknown): User | null {
  const result = userSchema.safeParse(data);
  return result.success ? result.data : null;
}
```

### Handling Third-Party Libraries

When a library returns `any`, immediately type it:

```typescript
// ✅ CORRECT: Type the result immediately
import jwt from 'jsonwebtoken';

interface JwtPayload {
  readonly userId: string;
  readonly email: string;
}

function verifyToken(token: string): JwtPayload {
  const decoded: unknown = jwt.verify(token, secret);
  return jwtPayloadSchema.parse(decoded);
}

// ❌ WRONG: Letting 'any' propagate
function verifyToken(token: string) {
  return jwt.verify(token, secret); // Returns 'any'
}
```

### Escape Hatches (Last Resort)

If you absolutely must bypass type checking (extremely rare), use a type assertion with a comment:

```typescript
// ✅ ACCEPTABLE: Documented escape hatch
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untypedLibrary = externalLib as any as TypedInterface;
// Reason: Library types are incorrect, see issue #123
```

---

## Zod Schema Guidelines

### Rule: Validate All External Data

Use Zod schemas for:
- API request bodies (backend)
- API response parsing (frontend)
- Form validation (frontend)
- Environment variables
- Configuration files
- Any data crossing trust boundaries

### Backend: Request Validation

```typescript
// ✅ CORRECT: Define schema and infer type
import { z } from 'zod';

// Schema definition
export const createTransactionSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1).max(500),
  category: z.enum(['Food', 'Transport', 'Entertainment']),
  type: z.enum(['income', 'expense']),
  date: z.string().datetime(),
});

// Infer TypeScript type from schema
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

// Use in route handler
router.post('/', validate(createTransactionSchema), async (req, res) => {
  const input: CreateTransactionInput = req.body;
  // input is now fully typed and validated
});
```

### Backend: Query Parameters

```typescript
// ✅ CORRECT: Validate query parameters
export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
```

### Frontend: Form Validation

```typescript
// ✅ CORRECT: Use Zod with React Hook Form
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignUpForm = z.infer<typeof signUpSchema>;

function SignUpPage() {
  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });
  // ...
}
```

### Frontend: API Response Validation

```typescript
// ✅ CORRECT: Validate API responses
const transactionSchema = z.object({
  id: z.string(),
  amount: z.number(),
  description: z.string(),
  category: z.string(),
  type: z.enum(['income', 'expense']),
  date: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const transactionsResponseSchema = z.object({
  data: z.array(transactionSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionsResponse = z.infer<typeof transactionsResponseSchema>;

// In API client
async function fetchTransactions(): Promise<TransactionsResponse> {
  const response = await fetch('/api/transactions');
  const data: unknown = await response.json();
  return transactionsResponseSchema.parse(data);
}
```

### Environment Variables

```typescript
// ✅ CORRECT: Validate environment at startup
const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(32),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);
// App crashes immediately if env is invalid
```

### Schema Organization

```
packages/backend/src/features/transactions/
├── transactions.schemas.ts    # All Zod schemas for this feature
├── transactions.service.ts    # Uses inferred types
├── transactions.routes.ts     # Uses schemas for validation
└── index.ts
```

---

## Function Signatures

### Explicit Return Types

Always specify return types for exported functions:

```typescript
// ✅ CORRECT: Explicit return type
export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

// ❌ WRONG: Implicit return type
export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
```

### Readonly Parameters

```typescript
// ✅ CORRECT: Readonly input, explicit output
function calculateTotal(
  items: readonly { readonly price: number; readonly quantity: number }[]
): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

### Generic Constraints

```typescript
// ✅ CORRECT: Constrained generics
function getProperty<T extends object, K extends keyof T>(
  obj: Readonly<T>,
  key: K
): T[K] {
  return obj[key];
}
```

---

## Error Handling

### Typed Error Classes

```typescript
// ✅ CORRECT: Custom error classes with readonly properties
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly errors: readonly {
      readonly field: string;
      readonly message: string;
    }[]
  ) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}
```

### Result Types (Alternative to Exceptions)

```typescript
// ✅ CORRECT: Explicit success/failure types
type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

async function tryFindUser(id: string): Promise<Result<User, NotFoundError>> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return { success: false, error: new NotFoundError('User not found') };
  }
  return { success: true, data: user };
}
```

---

## Type Inference vs Explicit Types

### When to Use Inference

- Local variables with obvious types
- Array methods (map, filter, reduce)
- Simple expressions

```typescript
// ✅ CORRECT: Let TypeScript infer
const count = items.length; // number
const names = users.map(u => u.name); // string[]
const total = prices.reduce((a, b) => a + b, 0); // number
```

### When to Be Explicit

- Function parameters and return types
- Class properties
- Exported values
- Complex objects

```typescript
// ✅ CORRECT: Explicit where it matters
export interface CreateUserInput {
  readonly email: string;
  readonly password: string;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  // ...
}
```

---

## Utility Types

### Prefer Built-in Utility Types

```typescript
// ✅ CORRECT: Use Readonly<T>
function processConfig(config: Readonly<Config>): void {
  // config properties cannot be modified
}

// ✅ CORRECT: Use Pick/Omit for partial types
type PublicUser = Omit<User, 'passwordHash'>;
type UserCredentials = Pick<User, 'email' | 'passwordHash'>;

// ✅ CORRECT: Use Record for dictionaries
type CategoryTotals = Readonly<Record<string, number>>;
```

### Custom Utility Types

```typescript
// ✅ CORRECT: DeepReadonly for nested immutability
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// ✅ CORRECT: NonNullable fields
type RequiredFields<T, K extends keyof T> = T & {
  [P in K]-?: NonNullable<T[P]>;
};
```

---

## Examples

### Complete Backend Service Example

```typescript
// transactions.schemas.ts
import { z } from 'zod';

export const createTransactionSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1).max(500),
  category: z.string(),
  type: z.enum(['income', 'expense']),
  date: z.string().datetime(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

// transactions.service.ts
import { prisma } from '../../shared/database.js';
import type { Transaction } from '@prisma/client';
import type { CreateTransactionInput } from './transactions.schemas.js';

interface TransactionService {
  readonly create: (
    userId: string,
    input: Readonly<CreateTransactionInput>
  ) => Promise<Transaction>;
  readonly findById: (
    userId: string,
    transactionId: string
  ) => Promise<Transaction | null>;
}

export const transactionsService: TransactionService = {
  async create(
    userId: string,
    input: Readonly<CreateTransactionInput>
  ): Promise<Transaction> {
    return prisma.transaction.create({
      data: {
        ...input,
        date: new Date(input.date),
        userId,
      },
    });
  },

  async findById(
    userId: string,
    transactionId: string
  ): Promise<Transaction | null> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (transaction?.userId !== userId) {
      return null;
    }

    return transaction;
  },
} as const;
```

### Complete Frontend Form Example

```typescript
// schemas.ts
import { z } from 'zod';

export const transactionFormSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, 'Date is required'),
});

export type TransactionFormData = z.infer<typeof transactionFormSchema>;

// transaction-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionFormSchema, type TransactionFormData } from '@/lib/schemas';

interface TransactionFormProps {
  readonly onSubmit: (data: Readonly<TransactionFormData>) => Promise<void>;
  readonly defaultValues?: Partial<Readonly<TransactionFormData>>;
}

export function TransactionForm({
  onSubmit,
  defaultValues,
}: TransactionFormProps): JSX.Element {
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues,
  });

  const handleSubmit = async (data: TransactionFormData): Promise<void> => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## Checklist for Code Review

Before submitting code, verify:

- [ ] All object properties are `readonly` unless mutation is required
- [ ] All array types use `readonly T[]` or `ReadonlyArray<T>`
- [ ] No usage of `any` (use `unknown` + Zod validation instead)
- [ ] All external data is validated with Zod schemas
- [ ] All exported functions have explicit return types
- [ ] Constants use `as const` assertion
- [ ] Service objects use `as const` assertion
- [ ] Error classes have `readonly` properties
- [ ] Form validation uses Zod + zodResolver
- [ ] API responses are validated with Zod schemas

---

> This document should be updated when TypeScript conventions change.
> For architecture details, see [ARCH.md](./ARCH.md).