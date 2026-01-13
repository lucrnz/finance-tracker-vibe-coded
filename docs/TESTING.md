# Testing Strategy

This document outlines the testing strategy for the Finance Tracker application.

> **Note:** Testing infrastructure is a work in progress and planned for future implementation.
> This document serves as a guide for when testing is set up.

## Table of Contents

- [Current Status](#current-status)
- [Recommended Test Stack](#recommended-test-stack)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [End-to-End Testing](#end-to-end-testing)
- [CI Integration](#ci-integration)
- [Test Organization](#test-organization)

---

## Current Status

| Test Type | Status | Priority |
|-----------|--------|----------|
| Unit Tests (Backend) | Not implemented | High |
| Unit Tests (Frontend) | Not implemented | High |
| Integration Tests (API) | Not implemented | Medium |
| E2E Tests | Not implemented | Medium |
| CI Pipeline | Not implemented | High |

---

## Recommended Test Stack

### Backend

| Tool | Purpose |
|------|---------|
| [Vitest](https://vitest.dev/) | Test runner (fast, ESM-native, Jest-compatible) |
| [Supertest](https://github.com/ladjs/supertest) | HTTP assertions for API testing |
| [Prisma Test Environment](https://www.prisma.io/docs/guides/testing) | Isolated test database |

### Frontend

| Tool | Purpose |
|------|---------|
| [Vitest](https://vitest.dev/) | Test runner |
| [React Testing Library](https://testing-library.com/react) | Component testing |
| [MSW (Mock Service Worker)](https://mswjs.io/) | API mocking |
| [user-event](https://testing-library.com/docs/user-event/intro) | User interaction simulation |

### End-to-End

| Tool | Purpose |
|------|---------|
| [Playwright](https://playwright.dev/) | Cross-browser E2E testing (recommended) |
| [Cypress](https://www.cypress.io/) | Alternative E2E framework |

---

## Backend Testing

### Unit Tests

Test service layer logic in isolation from the database.

**Recommended structure:**
```
packages/backend/src/
├── features/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   └── __tests__/
│   │       └── auth.service.test.ts
│   ├── transactions/
│   │   ├── transactions.service.ts
│   │   └── __tests__/
│   │       └── transactions.service.test.ts
```

**Example test (conceptual):**
```typescript
// auth.service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { authService } from '../auth.service';

describe('authService', () => {
  describe('signUp', () => {
    it('should hash password before storing', async () => {
      // Mock Prisma client
      // Call authService.signUp()
      // Assert password was hashed
    });

    it('should throw ConflictError if email exists', async () => {
      // Mock existing user
      // Assert ConflictError is thrown
    });
  });
});
```

### Integration Tests

Test API endpoints with a real (test) database.

**Recommended approach:**
1. Use a separate SQLite test database (`test.db`)
2. Reset database before each test suite
3. Use Supertest for HTTP assertions

**Example test (conceptual):**
```typescript
// auth.routes.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';

describe('POST /api/auth/signup', () => {
  const app = createApp();

  it('should create a new user and return token', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
  });
});
```

### Package.json Scripts (Recommended)

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Frontend Testing

### Unit Tests

Test components, hooks, and utilities in isolation.

**Recommended structure:**
```
packages/frontend/src/
├── components/
│   └── ui/
│       ├── button.tsx
│       └── __tests__/
│           └── button.test.tsx
├── lib/
│   ├── utils.ts
│   └── __tests__/
│       └── utils.test.ts
├── pages/
│   ├── dashboard.tsx
│   └── __tests__/
│       └── dashboard.test.tsx
```

**Example test (conceptual):**
```typescript
// button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### API Mocking with MSW

Mock API responses for component tests that depend on server data.

**Setup (conceptual):**
```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/transactions', () => {
    return HttpResponse.json({
      data: [{ id: '1', amount: 100, description: 'Test' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  }),
];
```

### Package.json Scripts (Recommended)

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

## End-to-End Testing

### Playwright Setup (Recommended)

Test complete user flows across the full stack.

**Recommended structure:**
```
e2e/
├── playwright.config.ts
├── tests/
│   ├── auth.spec.ts
│   ├── transactions.spec.ts
│   └── budgets.spec.ts
└── fixtures/
    └── test-data.ts
```

**Example test (conceptual):**
```typescript
// auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can sign up and access dashboard', async ({ page }) => {
    await page.goto('/signup');
    
    await page.fill('[name="email"]', 'newuser@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.fill('[name="confirmPassword"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('user can sign in with existing account', async ({ page }) => {
    await page.goto('/signin');
    
    await page.fill('[name="email"]', 'existing@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Running E2E Tests

```bash
# Install Playwright browsers
npx playwright install

# Run all E2E tests
npx playwright test

# Run with UI mode
npx playwright test --ui

# Run specific test file
npx playwright test tests/auth.spec.ts
```

---

## CI Integration

### Recommended GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run backend -- npm run db:generate
      - run: npm run backend -- npm run test:run

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: cd packages/frontend && npm run test:run

  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run backend &
      - run: npm run frontend &
      - run: npx playwright test
```

---

## Test Organization

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Unit test | `*.test.ts` / `*.test.tsx` | `auth.service.test.ts` |
| Integration test | `*.integration.test.ts` | `auth.routes.integration.test.ts` |
| E2E test | `*.spec.ts` | `auth.spec.ts` |

### Test File Location

- **Co-located:** Place tests in `__tests__/` directories next to source files
- **Separation:** Keep E2E tests in a top-level `e2e/` directory

### Coverage Goals (Recommended)

| Metric | Target |
|--------|--------|
| Line coverage | ≥ 80% |
| Branch coverage | ≥ 75% |
| Function coverage | ≥ 85% |

---

## Implementation Roadmap

When implementing testing, follow this suggested order:

1. **Set up Vitest** in both backend and frontend packages
2. **Add unit tests** for critical service layer logic (auth, transactions)
3. **Add component tests** for key UI components
4. **Set up MSW** for API mocking in frontend tests
5. **Add integration tests** for API endpoints
6. **Set up Playwright** for E2E testing
7. **Configure CI pipeline** with GitHub Actions
8. **Add coverage reporting** and enforce thresholds

---

> This document should be updated when testing infrastructure is implemented.
> For architecture details, see [ARCH.md](./ARCH.md).