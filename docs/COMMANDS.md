# Commands

This document lists workspace commands for local development, builds, and verification. Run commands from the repository root unless noted otherwise.

## Install and setup

```bash
npm install
npm run db:generate -w @finance-tracker/backend
npm run db:push -w @finance-tracker/backend
npm run db:migrate -w @finance-tracker/backend
```

## Development servers

```bash
npm run backend
npm run frontend
```

## Build and run

```bash
npm run backend:build
npm run backend:start
npm run frontend:build
npm run frontend:preview
```

## Database tools

```bash
npm run db:studio -w @finance-tracker/backend
```

## Testing

```bash
npm run test -w @finance-tracker/backend
npm run test:run -w @finance-tracker/backend
npm run test:coverage -w @finance-tracker/backend
npm run test -w @finance-tracker/frontend
npm run test:run -w @finance-tracker/frontend
npm run test:coverage -w @finance-tracker/frontend
```

## Linting and type checking

```bash
npm run lint -w @finance-tracker/frontend
npm exec tsc --noEmit -w @finance-tracker/backend
npm exec tsc --noEmit -w @finance-tracker/frontend
```
