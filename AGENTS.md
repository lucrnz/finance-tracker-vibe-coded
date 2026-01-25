# AGENTS.md

Finance Tracker is a full-stack personal finance management app built as an npm workspaces
monorepo with a Node.js/Express + Prisma backend and a React 19 + Vite frontend.

## Documentation
- [docs/ARCH.md](./docs/ARCH.md) — architecture, system overview, API design
- [docs/TYPESCRIPT.md](./docs/TYPESCRIPT.md) — strict TypeScript standards
- [docs/TESTING.md](./docs/TESTING.md) — testing strategy and roadmap
- [docs/COMMANDS.md](./docs/COMMANDS.md) — workspace, dev, build, lint, typecheck commands
- [docs/SECURITY.md](./docs/SECURITY.md) — secrets, env vars, auth/security practices
- [docs/GUARDRAILS.md](./docs/GUARDRAILS.md) — agent boundaries and required review
- [docs/EXTENSIBILITY.md](./docs/EXTENSIBILITY.md) — adding features, categories, UI components

## Git Commits
Use convential commits

## Universal guardrails

- Avoid editing secrets or `.env*` files; never commit them (see `docs/SECURITY.md`).
- Do not change database schema/migrations or auth/authorization logic without human review.
- New dependencies or top-level directories require explicit approval.
- Follow strict TypeScript + Zod validation rules (`docs/TYPESCRIPT.md`).
