# Architecture

## Essentials

- Stack: Express + Prisma + SQLite backend; React 19 + Vite + TailwindCSS frontend.
- Flow: UI → API client → routes → services → Prisma → database.
- Middleware: JSON parsing, logging, JWT auth, Zod validation.
- Backend layout: Feature modules in `packages/backend/src/features`; shared utilities in
  `packages/backend/src/shared`.
- Frontend layout: Pages in `packages/frontend/src/pages`, components in
  `packages/frontend/src/components`; auth via `AuthProvider` context.
- Data model: User, Transaction, Budget (unique by user/category/month/year).
- Auth: JWT stored in localStorage; sent in `Authorization` header; data scoped by `userId`.
- API surface: `GET /health`, `/api/auth/*`, `/api/categories`, `/api/transactions`,
  `/api/budgets`, `/api/reports`.

## API Route Structure

| Route | Auth |
|---|---|
| `GET /health` (health check) | No |
| `/api/auth/*` (sign up/in) | No |
| `/api/categories` (list categories) | No |
| `/api/transactions` (CRUD) | Yes |
| `/api/budgets` (CRUD) | Yes |
| `/api/reports` (monthly spend) | Yes |
