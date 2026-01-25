# Agent Guardrails

Constraints and review requirements for agents.

## Files never auto-modified
- `*.lock` files such as `package-lock.json` (only modify via `npm install`)
- `.env*` files (contain secrets; never commit or auto-generate)

## Required human review

- Database migrations (`prisma migrate`)
- Authentication or authorization logic changes
- Modifications to `shared/config.ts` or `shared/errors.ts`
- Dependency version upgrades

## Boundaries

- Do not create new top-level directories without approval.
- Do not add new npm dependencies without justification.
- Keep feature modules under `src/features/`.
- Backend: do not bypass Prisma with raw SQL unless explicitly needed.
- Frontend: do not store sensitive data in localStorage beyond the JWT token.
- Always validate external input with Zod before processing.
