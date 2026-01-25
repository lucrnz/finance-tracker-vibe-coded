# Testing Strategy

This document defines how tests are organized and the intended progression of testing coverage.

Related docs:
- [COMMANDS.md](./COMMANDS.md) — workspace scripts
- [ARCH.md](./ARCH.md) — architecture context

## Tooling

- Vitest is the test runner used in both backend and frontend.

## Conventions

- Place tests in `__tests__/` next to source files.
- Naming: unit `*.test.ts(x)`, integration `*.integration.test.ts`.
