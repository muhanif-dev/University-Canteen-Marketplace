# Decisions

## Phase 1 — Foundation

### 1. Tailwind CSS v4 with CSS-first configuration

**Decision:** Use Tailwind CSS v4 with the CSS-first approach (no `tailwind.config.ts`).
**Reason:** The project was initialized with Tailwind v4 and `@tailwindcss/postcss`. The v4 CSS-first approach is the current stable direction and reduces configuration overhead.

### 2. shadcn/ui new-york style with neutral base color

**Decision:** Use the `new-york` style variant of shadcn/ui with a `neutral` base color and CSS variables enabled.
**Reason:** The new-york style is compact and modern. Neutral base color keeps the UI professional and easy to customize. CSS variables allow dark mode support.

### 3. OKLCH color space for design tokens

**Decision:** Use OKLCH color values in `globals.css` design tokens.
**Reason:** shadcn/ui v4 defaults use OKLCH for perceptually uniform color manipulation. This matches the shadcn/ui ecosystem.

### 4. Path alias `@/*` for imports

**Decision:** Use the `@/*` path alias mapping to the project root.
**Reason:** Already configured in the existing `tsconfig.json` and required by `components.json` for shadcn/ui alias resolution.

### 5. Role and status definitions as const objects

**Decision:** Define roles, account statuses, order statuses, and customer types as `as const` objects in `types/index.ts` rather than TypeScript enums.
**Reason:** `as const` objects avoid the runtime and isolatedModules complexities of enums while providing full type safety and tree-shakeable imports.

### 6. Error infrastructure as class hierarchy

**Decision:** Create an `AppError` base class with subclasses (`ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`) in `lib/errors.ts`.
**Reason:** Provides a consistent, typed error foundation for future API route handlers to extend. Each error carries a status code and machine-readable code.

### 7. tw-animate-css instead of tailwindcss-animate

**Decision:** Use `tw-animate-css` for animation utilities.
**Reason:** `tailwindcss-animate` is not compatible with Tailwind v4. `tw-animate-css` is the v4-compatible replacement used by the current shadcn/ui setup.
