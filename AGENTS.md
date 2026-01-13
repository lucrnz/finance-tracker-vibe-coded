# AGENTS.md

This document is designed for **automated code agents** (AI coding assistants, CI bots, and
similar tooling) to understand the structure, conventions, and guardrails of this repository.

## Living Documentation

**This file must be kept up to date.** When adding features, changing architecture, or modifying
conventions, update this document accordingly. AGENTS.md serves as the single source of truth
for agents operating on this codebase.

### Documentation Hierarchy

```
AGENTS.md                    ← High-level overview (this file)
└── docs/
    ├── ARCH.md              ← Detailed architecture documentation
    ├── TYPESCRIPT.md        ← TypeScript coding guidelines (strict)
    ├── TESTING.md           ← Testing strategy and recommendations
    └── ADR/                 ← Architecture Decision Records
        └── NNNN-title.md    ← Individual decision records
```

**Key principles:**

1. **AGENTS.md outlines the basics** — Keep this file concise and scannable. It should provide
   enough context for an agent to navigate the codebase and follow conventions.

2. **Link to detailed docs** — For in-depth explanations, link to files in the `docs/` directory.
   Agents should follow these links when deeper context is needed.

3. **Update on major changes** — When performing tasks that involve:
   - New features or modules
   - Architectural decisions
   - Convention changes
   - New dependencies or tools
   
   Update AGENTS.md and/or create/update relevant docs in `docs/`.

4. **ADRs for decisions** — When making significant technical decisions, create an Architecture
   Decision Record in `docs/ADR/` following the template in `docs/ADR/README.md`.

---

# Project Overview

Finance Tracker is a full-stack personal finance management application built as an npm workspaces
monorepo. It provides users with tools to track income and expenses, set category-based budgets,
and generate monthly spending reports. The backend is a Node.js/Express REST API with SQLite
persistence via Prisma ORM; the frontend is a React 19 SPA using Vite, TailwindCSS, and shadcn/ui
components. Authentication is handled via JWT tokens with bcrypt password hashing.

## Repository Structure

| Directory | Description |
|-----------|-------------|
| `packages/backend/` | Node.js + Express + TypeScript API server with Prisma/SQLite |
| `packages/frontend/` | React 19 + Vite + TailwindCSS + shadcn/ui client application |
| `docs/` | Architecture documentation and ADRs |
| `package.json` | Root npm workspaces configuration |

For detailed directory structure, see [docs/ARCH.md](./docs/ARCH.md#repository-structure).

## Development Commands

### Installation & Setup

```bash
# Install all dependencies (root + workspaces)
npm install

# Generate Prisma client
npm run backend -- npm run db:generate

# Create/sync database schema (development)
npm run backend -- npm run db:push

# Run database migrations (production)
npm run backend -- npm run db:migrate
```

### Running Development Servers

```bash
# Start backend with hot reload (http://localhost:3000)
npm run backend

# Start frontend dev server (http://localhost:5173)
npm run frontend
```

### Building for Production

```bash
# Build backend (outputs to packages/backend/dist/)
npm run backend:build

# Start production backend
npm run backend:start

# Build frontend (outputs to packages/frontend/dist/)
npm run frontend:build

# Preview production frontend build
npm run frontend:preview
```

### Database Management

```bash
# Open Prisma Studio GUI
cd packages/backend && npm run db:studio
```

### Linting & Type Checking

```bash
# Lint frontend code
cd packages/frontend && npm run lint

# Type-check backend
cd packages/backend && npx tsc --noEmit

# Type-check frontend
cd packages/frontend && npx tsc --noEmit
```

## Code Style & Conventions

### General

- **Language:** TypeScript (strict mode) for both backend and frontend.
- **Module System:** ESM (`"type": "module"`) in both packages.
- **Line Length:** ~100 characters (soft limit).

### Backend Conventions

- **File Naming:** `kebab-case` for files (e.g., `auth.service.ts`, `error-handler.ts`).
- **Feature Modules:** Each domain lives under `src/features/<name>/` with:
  - `<name>.routes.ts` — Express router
  - `<name>.service.ts` — Business logic
  - `<name>.schemas.ts` — Zod validation schemas
  - `index.ts` — Public exports
- **Error Handling:** Use custom error classes from `shared/errors.ts`
  (`ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`).
- **Immutability:** Prefer `readonly` modifiers and `as const` assertions.

### Frontend Conventions

- **File Naming:** `kebab-case` for files (e.g., `auth-context.tsx`, `app-layout.tsx`).
- **Path Aliases:** Use `@/` prefix for imports from `src/` (configured in tsconfig).
- **Components:** Functional components with TypeScript; use shadcn/ui components.
- **State Management:** React Query for server state; React Context for auth state.
- **Styling:** TailwindCSS v4 with `cn()` utility for class merging.

### TypeScript Guidelines

**Strict type safety is mandatory.** See [docs/TYPESCRIPT.md](./docs/TYPESCRIPT.md) for complete
guidelines.

**Key rules:**

| Rule | Requirement |
|------|-------------|
| `readonly` | Use for all properties, arrays, and parameters by default |
| `any` | **Never use** — use `unknown` + Zod validation instead |
| `as const` | Use for constants and service objects |
| Zod schemas | Required for all external data (API, forms, env vars) |
| Return types | Explicit for all exported functions |

```typescript
// ✅ CORRECT: Readonly, typed, validated
interface User {
  readonly id: string;
  readonly email: string;
}

export async function createUser(input: Readonly<CreateUserInput>): Promise<User> {
  const validated = createUserSchema.parse(input);
  // ...
}

// ❌ WRONG: Mutable, any, no validation
interface User {
  id: string;
  email: any;
}
```

## Architecture Notes

For detailed architecture documentation including diagrams, data flow, and API design, see
[docs/ARCH.md](./docs/ARCH.md).

### Quick Reference

| Aspect | Details |
|--------|---------|
| **Backend** | Express.js with feature-based modules under `src/features/` |
| **Frontend** | React 19 with pages, components, and contexts |
| **Database** | SQLite via Prisma ORM |
| **Auth** | JWT tokens with bcrypt password hashing |
| **Validation** | Zod schemas on both frontend and backend |

### Key Domain Models

| Model       | Description                                      |
|-------------|--------------------------------------------------|
| User        | Account with email/password; owns transactions and budgets |
| Transaction | Income or expense entry with amount, category, date |
| Budget      | Monthly spending limit per category              |

### API Routes (Summary)

| Prefix              | Auth Required | Description                     |
|---------------------|---------------|---------------------------------|
| `GET /health`       | No            | Health check                    |
| `/api/auth/*`       | No            | Sign up, sign in                |
| `/api/categories`   | No            | List available categories       |
| `/api/transactions` | Yes (JWT)     | CRUD for user's transactions    |
| `/api/budgets`      | Yes (JWT)     | CRUD for user's budgets         |
| `/api/reports`      | Yes (JWT)     | Monthly spending reports        |

See [docs/ARCH.md#api-design](./docs/ARCH.md#api-design) for response formats and pagination.

## Testing Strategy

Testing infrastructure is a **work in progress** planned for future implementation.

For detailed recommendations on test setup, tools, and implementation roadmap, see
[docs/TESTING.md](./docs/TESTING.md).

## Security & Compliance

### Secrets Handling

- **JWT_SECRET:** Required environment variable; must be set in production.
- **DATABASE_URL:** Connection string for Prisma; defaults to `file:./dev.db`.
- **Never commit `.env` files** — add to `.gitignore`.

### Environment Variables

Create `packages/backend/.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3000
```

Frontend environment (optional):

```env
VITE_API_URL="http://localhost:3000"
```

### Authentication Security

- Passwords hashed with bcrypt (12 salt rounds).
- JWT tokens expire after 7 days.
- User-scoped data access enforced at service layer.

## Agent Guardrails

### Files Never Auto-Modified

- `packages/backend/prisma/schema.prisma` — Schema changes require human review.
- `*.lock` files (`package-lock.json`) — Only modify via `npm install`.
- `.env*` files — Contain secrets; never commit or auto-generate.

### Required Human Review

- Database migrations (`prisma migrate`).
- Authentication/authorization logic changes.
- Any modifications to `shared/config.ts` or `shared/errors.ts`.
- Dependency version upgrades.

### Rate Limits & Boundaries

- Do not create new top-level directories without approval.
- Do not add new npm dependencies without justification.
- Keep feature modules self-contained under `src/features/`.

### Coding Boundaries

- Backend: Do not bypass Prisma for raw SQL without explicit need.
- Frontend: Do not store sensitive data in localStorage beyond JWT token.
- Always validate input with Zod schemas before processing.

## Extensibility Hooks

### Environment Variables

| Variable        | Package  | Description                              | Default              |
|-----------------|----------|------------------------------------------|----------------------|
| `PORT`          | backend  | HTTP server port                         | `3000`               |
| `JWT_SECRET`    | backend  | Secret for signing JWT tokens            | (required)           |
| `DATABASE_URL`  | backend  | Prisma database connection string        | `file:./dev.db`      |
| `VITE_API_URL`  | frontend | Backend API base URL                     | `http://localhost:3000` |

### Adding New Features

1. Create feature directory: `packages/backend/src/features/<name>/`
2. Implement: `<name>.routes.ts`, `<name>.service.ts`, `<name>.schemas.ts`, `index.ts`
3. Register router in `packages/backend/src/app.ts`
4. Add corresponding API client methods in `packages/frontend/src/lib/api.ts`

### Adding New Categories

Modify both:
- `packages/backend/src/features/categories/categories.constants.ts`
- `packages/frontend/src/lib/constants.ts`

### Plugin Points

- **Middleware:** Add to `packages/backend/src/app.ts` before routes.
- **UI Components:** Extend `packages/frontend/src/components/ui/` using shadcn/ui (see below).
- **React Query:** Configure in `packages/frontend/src/App.tsx` (`QueryClient` options).

### Adding UI Components (shadcn/ui)

**Always use the shadcn CLI** to add new UI components instead of manually creating them:

```bash
# Navigate to the frontend package
cd packages/frontend

# Add a component using the CLI
npx shadcn@latest add <component-name>

# Examples:
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add table
```

**Why use the CLI:**
- Ensures consistent component structure and styling
- Automatically handles dependencies and imports
- Keeps components aligned with shadcn/ui updates
- Components are added to `src/components/ui/` with proper configuration

**Only create custom components manually when:**
- The component doesn't exist in the shadcn/ui library
- You need significant customization beyond what shadcn provides
- Building composite/feature-specific components that combine multiple primitives

Refer to [shadcn/ui documentation](https://ui.shadcn.com/) for available components.

## Further Reading

### Project Documentation

- [README.md](./README.md) — Project overview, setup instructions, and API examples
- [docs/ARCH.md](./docs/ARCH.md) — Detailed architecture documentation
- [docs/TYPESCRIPT.md](./docs/TYPESCRIPT.md) — TypeScript coding guidelines (strict)
- [docs/TESTING.md](./docs/TESTING.md) — Testing strategy and recommendations
- [docs/ADR/README.md](./docs/ADR/README.md) — Architecture Decision Records index

### Source References

- [packages/backend/prisma/schema.prisma](./packages/backend/prisma/schema.prisma) — Database schema
- [packages/backend/src/app.ts](./packages/backend/src/app.ts) — Backend route registration
- [packages/frontend/src/App.tsx](./packages/frontend/src/App.tsx) — Frontend routing setup
