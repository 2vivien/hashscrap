# HashScrap Web

Frontend scaffold using TanStack Start, React, TypeScript and Tailwind CSS v4. The visual direction follows docs/DESIGN-SYSTEM.md.

## Local development

    cd apps/web
    npm install
    npm run dev

`npm run dev` starts the interface alone on http://localhost:5173. It needs no database.

### One command for the full local stack

    cd apps/web
    npm run dev:stack

It requires Docker Desktop and a `.env` file at the repository root with `POSTGRES_PASSWORD` set. It starts in order: PostgreSQL container, `alembic upgrade head`, then the Vite dev server. It never runs `docker compose down -v`, so the database volume is preserved. Stop the database separately with:

    npm run stack:down

Related commands: `stack:ready` (database and migrations without the dev server), `stack:logs` (application logs).

### Quality gates

    npm run test        # vitest
    npm run typecheck   # vite build && tsc --noEmit
    npm run check       # both, in order

## Current state

This PR implements the application shell, accessible navigation, responsive design tokens, a truthful empty dashboard, and holding states for Sources and Collectes. There are no backend endpoints exposed by the current Python CLI, so server data is not mocked and write actions are disabled with explanations.

Do not enable source creation, launch/cancel/retry actions, metrics, or collection logs until API contracts and real error states are defined. The next integration step is a versioned FastAPI contract and generated/shared client types; do not infer routes from database tables.

## Design and accessibility

- Dark Intelligence Workbench palette from docs/DESIGN-SYSTEM.md, exposed once as Tailwind 4 `@theme` tokens in `src/styles.css`.
- Single navigation registry in `src/lib/sections.ts`: sections, nav groups and breadcrumb labels; tests fail if a link points at an undeclared section.
- Router `Link` navigation, skip link to the main content, accessible names kept when the sidebar collapses.
- Visible keyboard focus and semantic landmarks.
- Shared `EmptyState`, `InlineAlert` and `ErrorState` components; a route that does not exist renders an explicit error state instead of an empty one.
- Responsive sidebar and content for desktop, tablet and mobile.
- Reduced-motion preference respected.
- Disabled actions explain their current limitation.
