# HashScrap Web

Frontend scaffold using TanStack Start, React, TypeScript and Tailwind CSS v4. The visual direction follows docs/DESIGN-SYSTEM.md.

## Local development

    cd apps/web
    npm install
    npm run dev
    npm run typecheck
    npm test
    npm run build

## Current state

This PR implements the application shell, accessible navigation, responsive design tokens, a truthful empty dashboard, and holding states for Sources and Collectes. There are no backend endpoints exposed by the current Python CLI, so server data is not mocked and write actions are disabled with explanations.

Do not enable source creation, launch/cancel/retry actions, metrics, or collection logs until API contracts and real error states are defined. The next integration step is a versioned FastAPI contract and generated/shared client types; do not infer routes from database tables.

## Design and accessibility

- Dark Intelligence Workbench palette from docs/DESIGN-SYSTEM.md.
- Visible keyboard focus and semantic landmarks.
- Navigation labels and current-page state.
- Responsive sidebar and content for desktop, tablet and mobile.
- Reduced-motion preference respected.
- Disabled actions explain their current limitation.
