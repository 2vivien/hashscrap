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

It requires Docker Desktop and a `.env` file at the repository root with `POSTGRES_PASSWORD` set. It starts in order: PostgreSQL container, application image build, `alembic upgrade head`, read-only API, then the Vite dev server. It never runs `docker compose down -v`, so the database volume is preserved. Stop the containers separately with:

    npm run stack:down

Related commands: `stack:ready` (database and migrations without the dev server), `stack:logs` (application logs).

### Quality gates

    npm run test        # vitest
    npm run typecheck   # vite build && tsc --noEmit
    npm run check       # both, in order

## Data

The overview and Sources views read the engine through the read-only API described in [docs/API.md](../../docs/API.md). Requests are issued from route server functions, so the API client never reaches the browser bundle and the database stays private.

- The web server reads `HASHSCRAP_API_URL`, defaulting to `http://127.0.0.1:8001`. The published host port is configurable with `HASHSCRAP_API_PORT` in `.env` because 8000 is often taken by another local service.
- When the API is unreachable, the view renders an explicit error panel. When it answers but nothing has been collected, it renders an explicit zero state. Sample data is never substituted for either.

To see real numbers, persist a collection first:

    docker compose run --rm app hashscrap run --config examples/sources.json --source example-site

## Current state

The shell, accessible navigation, responsive design tokens and truthful empty states are in place, and the overview plus sources views read persisted evidence. Investigations, collections, entities, timeline, reports and parameters have no API contract yet, so they keep their explicit not-connected state, and write actions stay disabled with the reason attached.

Do not enable source creation or crawl launch until their contracts define permissions, audit and error states. Do not infer routes from database tables.

## Design and accessibility

- Dark Intelligence Workbench palette from docs/DESIGN-SYSTEM.md, exposed once as Tailwind 4 `@theme` tokens in `src/styles.css`.
- Single navigation registry in `src/lib/sections.ts`: sections, nav groups and breadcrumb labels; tests fail if a link points at an undeclared section.
- Router `Link` navigation, skip link to the main content, accessible names kept when the sidebar collapses.
- Visible keyboard focus and semantic landmarks.
- Shared `EmptyState`, `InlineAlert`, `ErrorState`, `MetricCard`, `StatusBadge` and `LoadingSkeleton` components; a route that does not exist renders an explicit error state instead of an empty one.
- Status is always carried by a text label next to its colour, never by colour alone.
- Responsive sidebar and content for desktop, tablet and mobile.
- Reduced-motion preference respected.
- Disabled actions explain their current limitation.