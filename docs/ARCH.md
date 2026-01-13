# Architecture Documentation

This document provides detailed architecture information for the Finance Tracker application.
For a high-level overview, see [AGENTS.md](../AGENTS.md).

## Table of Contents

- [Repository Structure](#repository-structure)
- [System Overview](#system-overview)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Data Model](#data-model)
- [Authentication Flow](#authentication-flow)
- [API Design](#api-design)
- [API Route Structure](#api-route-structure)

---

## Repository Structure

```
finance-tracker/
├── packages/
│   ├── backend/          # Express.js REST API with Prisma ORM
│   │   ├── prisma/       # Database schema and migrations
│   │   └── src/
│   │       ├── features/ # Domain modules (auth, transactions, budgets, reports, categories)
│   │       └── shared/   # Cross-cutting concerns (config, errors, middleware, logger)
│   └── frontend/         # React 19 SPA with Vite
│       ├── src/
│       │   ├── components/  # UI components (layout, ui primitives)
│       │   ├── contexts/    # React context providers (auth)
│       │   ├── lib/         # API client, utilities, schemas
│       │   └── pages/       # Route-level page components
│       └── public/          # Static assets
├── docs/                 # Documentation
│   ├── ARCH.md           # This file - detailed architecture
│   └── ADR/              # Architecture Decision Records
├── package.json          # Root workspace configuration
├── AGENTS.md             # Agent documentation (high-level)
└── README.md             # Project documentation
```

### Package Descriptions

| Package | Description |
|---------|-------------|
| `packages/backend/` | Node.js + Express + TypeScript API server with Prisma/SQLite |
| `packages/frontend/` | React 19 + Vite + TailwindCSS + shadcn/ui client application |
| `docs/` | Architecture documentation and decision records |

---

## System Overview

Finance Tracker is a full-stack monorepo application consisting of:

- **Backend:** Node.js/Express REST API with Prisma ORM and SQLite
- **Frontend:** React 19 SPA with Vite, TailwindCSS, and shadcn/ui

The application follows a clear separation of concerns with feature-based module organization
on the backend and component-based architecture on the frontend.

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React)                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Pages     │  │  Contexts   │  │ Components  │  │   lib/api.ts        │ │
│  │  (routes)   │──│  (auth)     │──│  (UI)       │──│  (API client)       │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┬──────────┘ │
└────────────────────────────────────────────────────────────────┼────────────┘
                                                                 │ HTTP/JSON
                                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (Express)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Routes    │──│  Services   │──│   Prisma    │──│   SQLite Database   │ │
│  │  (Express)  │  │  (Logic)    │  │   (ORM)     │  │   (dev.db)          │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Middleware: JSON parsing → Logging → Auth (JWT) → Validation (Zod) │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Authentication:** User signs up/in → backend hashes password with bcrypt, returns JWT.
2. **Protected Routes:** Frontend stores JWT in localStorage, sends via `Authorization` header.
3. **Transactions:** CRUD operations scoped to authenticated user via `userId` from JWT.
4. **Budgets:** Category-based monthly budgets; unique constraint on (userId, category, month, year).
5. **Reports:** Aggregated spending data by category for a given month/year.

---

## Backend Architecture

### Directory Structure

```
packages/backend/src/
├── features/           # Domain-driven feature modules
│   ├── auth/           # Authentication (signup, signin, JWT)
│   ├── budgets/        # Budget management
│   ├── categories/     # Transaction categories
│   ├── reports/        # Financial reports
│   └── transactions/   # Transaction CRUD
├── shared/             # Cross-cutting concerns
│   ├── config.ts       # Environment configuration
│   ├── database.ts     # Prisma client singleton
│   ├── errors.ts       # Custom error classes
│   ├── logger.ts       # Logging utility
│   ├── middleware/     # Express middleware
│   └── types.ts        # Shared TypeScript types
├── app.ts              # Express app factory
└── index.ts            # Server entry point
```

### Feature Module Pattern

Each feature module follows a consistent structure:

| File | Purpose |
|------|---------|
| `<feature>.routes.ts` | Express router with endpoint definitions |
| `<feature>.service.ts` | Business logic and database operations |
| `<feature>.schemas.ts` | Zod schemas for request validation |
| `index.ts` | Public exports (router) |

### Error Handling

Custom error classes in `shared/errors.ts` provide consistent HTTP responses:

- `ValidationError` (400) — Invalid request data
- `UnauthorizedError` (401) — Missing or invalid authentication
- `ForbiddenError` (403) — Insufficient permissions
- `NotFoundError` (404) — Resource not found
- `ConflictError` (409) — Duplicate resource

---

## Frontend Architecture

### Directory Structure

```
packages/frontend/src/
├── components/
│   ├── layout/         # App shell, sidebar, protected routes
│   └── ui/             # Reusable UI primitives (shadcn/ui)
├── contexts/           # React context providers
├── lib/                # Utilities, API client, schemas
├── pages/              # Route-level page components
├── App.tsx             # Root component with routing
└── main.tsx            # Application entry point
```

### State Management

| State Type | Solution |
|------------|----------|
| Server state | TanStack Query (React Query) |
| Auth state | React Context (`AuthProvider`) |
| Form state | React Hook Form + Zod |
| UI state | Local component state |

### Routing

React Router v7 with protected route wrapper:

- `/` — Landing page (public)
- `/signin`, `/signup` — Authentication (public)
- `/dashboard` — Main dashboard (protected)
- `/transactions` — Transaction management (protected)
- `/budgets` — Budget management (protected)

---

## Data Model

### Entity Relationship

```
┌──────────┐       ┌───────────────┐       ┌──────────┐
│   User   │──────<│  Transaction  │       │  Budget  │
└──────────┘  1:N  └───────────────┘       └──────────┘
      │                                          │
      └──────────────────────────────────────────┘
                         1:N
```

### Models

**User**
- `id` (cuid) — Primary key
- `email` (unique) — User email
- `passwordHash` — Bcrypt hash
- `createdAt`, `updatedAt` — Timestamps

**Transaction**
- `id` (cuid) — Primary key
- `amount` (float) — Transaction amount
- `description` — Transaction description
- `category` — Category name
- `type` — "income" or "expense"
- `date` — Transaction date
- `userId` — Foreign key to User

**Budget**
- `id` (cuid) — Primary key
- `amount` (float) — Budget limit
- `category` — Category name
- `month` (1-12), `year` — Budget period
- `userId` — Foreign key to User
- Unique constraint: (userId, category, month, year)

---

## Authentication Flow

```
┌────────┐     POST /api/auth/signup     ┌─────────┐
│ Client │ ──────────────────────────────> │ Backend │
└────────┘                                └─────────┘
    │                                          │
    │  { email, password }                     │
    │                                          ▼
    │                              ┌─────────────────────┐
    │                              │ Hash password       │
    │                              │ Create user         │
    │                              │ Generate JWT        │
    │                              └─────────────────────┘
    │                                          │
    │  { user, token }                         │
    │ <────────────────────────────────────────┘
    │
    │  Store token in localStorage
    │
    │     GET /api/transactions
    │     Authorization: Bearer <token>
    │ ─────────────────────────────────────────>
```

---

## API Design

### Response Format

**Success:**
```json
{
  "data": { ... },
  "pagination": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "errors": [{ "field": "email", "message": "Invalid email format" }]
  }
}
```

### Pagination

List endpoints support query parameters:
- `page` (default: 1)
- `limit` (default: 10, max: 100)

---

## API Route Structure

| Prefix              | Auth Required | Description                     |
|---------------------|---------------|---------------------------------|
| `GET /health`       | No            | Health check                    |
| `/api/auth/*`       | No            | Sign up, sign in                |
| `/api/categories`   | No            | List available categories       |
| `/api/transactions` | Yes (JWT)     | CRUD for user's transactions    |
| `/api/budgets`      | Yes (JWT)     | CRUD for user's budgets         |
| `/api/reports`      | Yes (JWT)     | Monthly spending reports        |

---

> This document should be updated when significant architectural changes are made.
> For specific decisions, see [ADR/README.md](./ADR/README.md).
