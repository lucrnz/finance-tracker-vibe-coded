# Extensibility

Patterns and entry points for expanding features, categories, and UI components.

## Adding new backend features

1. Create a feature directory: `packages/backend/src/features/<name>/`
2. Implement:
   - `<name>.routes.ts` (Express router)
   - `<name>.service.ts` (business logic)
   - `<name>.schemas.ts` (Zod schemas)
   - `index.ts` (public exports)
3. Register the router in `packages/backend/src/app.ts`.
4. Add API client methods in `packages/frontend/src/lib/api.ts`.

## Adding new categories

Update both:

- `packages/backend/src/features/categories/categories.constants.ts`
- `packages/frontend/src/lib/constants.ts`

## Plugin points

- **Middleware:** Register in `packages/backend/src/app.ts` before routes.
- **UI components:** Extend `packages/frontend/src/components/ui/` using shadcn/ui.
- **React Query:** Configure query defaults in `packages/frontend/src/App.tsx`.

## Adding UI components (shadcn/ui)

Always use the shadcn CLI instead of manually creating UI primitives:

```bash
cd packages/frontend
npx shadcn@latest add <component-name>
```

Examples:

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add table
```

Create custom components manually only when:

- The component does not exist in shadcn/ui.
- The required design deviates significantly from the standard primitive.
- You are composing multiple primitives into a feature-specific component.
