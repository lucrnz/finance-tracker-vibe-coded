# TypeScript Guidelines

Rules for strict, safe TypeScript.
These rules are mandatory: when in doubt, pick the stricter option.

## Core principles
- Type safety is non-negotiable.
- Immutability by default (`readonly`).
- Never use `any` (use `unknown` + narrowing).
- Validate external data with Zod.
- Fail fast at compile time.

## Required TypeScript settings
Both backend and frontend must enable:
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

## Immutability (`readonly`)
- Use `readonly` on properties, arrays, and function params.
- Use `as const` for literal types and service objects.
```typescript
interface User {
  readonly id: string;
  readonly email: string;
}

const categories = ['Food', 'Transport'] as const;
type Category = typeof categories[number];
```

## Avoiding `any`
- Use `unknown` and narrow.
- If a library returns `any`, type it immediately.
```typescript
function parseJson(input: string): unknown {
  return JSON.parse(input);
}

function processData(data: unknown): string {
  if (typeof data === 'string') return data.toUpperCase();
  throw new Error('Invalid data format');
}
```

Escape hatch (rare): document and isolate.
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untypedLibrary = externalLib as any as TypedInterface;
// Reason: library types are incorrect, see issue #123
```

## Zod validation rules
Use Zod for all external data:
- API request/response payloads
- Forms
- Env/config
- Any trust boundary

Backend pattern:
```typescript
export const createTransactionSchema = z.object({
  amount: z.number().positive(),
});
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
```

Frontend pattern:
```typescript
const transactionSchema = z.object({
  id: z.string(),
  amount: z.number(),
});
export type Transaction = z.infer<typeof transactionSchema>;
```

Env validation at startup:
```typescript
const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(32),
});
export const env = envSchema.parse(process.env);
```

Schema organization (backend):
```
packages/backend/src/features/<feature>/
├── <feature>.schemas.ts
├── <feature>.service.ts
├── <feature>.routes.ts
└── index.ts
```

## Function signatures
- Explicit return types for exported functions.
- Readonly inputs.
```typescript
export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}
```

## Type inference vs explicit
Infer local, simple values; be explicit on exports and complex objects.
```typescript
const total = prices.reduce((a, b) => a + b, 0);

export interface CreateUserInput {
  readonly email: string;
}
```

## Utility types
Prefer built-in utility types (`Readonly`, `Pick`, `Omit`, `Record`). Custom types only when needed.
```typescript
type PublicUser = Omit<User, 'passwordHash'>;
type CategoryTotals = Readonly<Record<string, number>>;
```

## Error handling
Use typed errors or explicit result types.
```typescript
type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };
```

## Code review checklist
- `readonly` used by default
- No `any`
- Zod validation for external data
- Explicit return types on exports
- `as const` for literals and service objects
- Typed errors or `Result` pattern
