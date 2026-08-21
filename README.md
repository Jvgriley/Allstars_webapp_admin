# Sporting Allstars Web Admin

The Sporting Allstars Web Admin platform — the management, intelligence and
commercial interface for clubs, teams and organisations in the Sporting
Allstars ecosystem. This repository currently holds the frontend
foundation: a React + TypeScript single-page app with real routing, a
typed service layer, and every screen from the original Figma Make
prototype, still running entirely on local mock data.

## Stack

- **React 18** + **TypeScript**, built with **Vite 6**
- **Tailwind CSS v4** with a Sporting Allstars brand theme (`src/styles/theme.css`)
- **shadcn/ui**-style components on **Radix UI** primitives (`src/app/components/ui`)
- **React Router 7** for client-side routing
- **Recharts** for charts

No backend, authentication, or real API integration exists yet — every
screen reads from an in-memory mock service layer (`src/services/`). See
`TECHNICAL_AUDIT.md` in the project history for the full architecture
audit and roadmap this foundation was built from.

## Requirements

- Node.js 20+
- [pnpm](https://pnpm.io) (the repo is set up as a pnpm project; npm/yarn
  will also work but pnpm is recommended)

## Install

```bash
pnpm install
```

## Develop

```bash
pnpm dev
```

Starts the Vite dev server (default: http://localhost:5173) with hot
module reloading.

## Type-check

```bash
pnpm typecheck
```

Runs the TypeScript compiler in `--noEmit` mode against the strict
`tsconfig.json`. This also runs automatically as the first step of
`pnpm build`, so a type error fails the build rather than shipping
silently.

## Build

```bash
pnpm build
```

Type-checks, then produces a static production build in `dist/`. Because
this is a client-side-only SPA, `dist/` can be served from any static
host or CDN — no Node server is required at runtime.

## Preview a production build locally

```bash
pnpm preview
```

Serves the contents of `dist/` locally, useful for a final sanity check
before deploying.

## Project structure

```
src/
  app/
    components/       Shared layout (AppShell) + brand primitives (PageHeader, Panel, StatCard, …)
    components/ui/    shadcn/Radix component library
    components/figma/ Figma Make-generated helper components
    pages/            One file per feature area (Dashboard, People, Sport, Live, …)
    App.tsx           Router root
    routes.tsx         Route table — one URL per screen
    routing.ts         PageId → URL mapping + navigate() helper
    nav.tsx             Sidebar navigation structure
  domain/
    types.ts           Shared entity types (Member, Fixture, Ranking, …)
  services/
    *.ts                One module per domain area: mock data + async
                        accessor functions + a matching React hook
                        (e.g. `useMembers()`). This is the seam a real
                        backend integration will plug into later —
                        page components only ever talk to hooks here,
                        never to raw data.
  styles/               Tailwind + brand theme tokens
```

## Notes for the next phase

- Every route is real and shareable (`/members/:memberId`, `/live/match`,
  etc.) — the app no longer relies on in-memory page state.
- The mock data that used to live in one `data.ts` file now lives inside
  the service layer, one file per domain, each already returning
  `Promise`s and exposing loading/error state via `useAsyncData`. A real
  backend integration means adding a second implementation of each
  service interface — no page component should need to change.
- Authentication, real API connectivity, and role-based access control
  are intentionally not part of this foundation — see the technical
  audit for the recommended handover requirements before that work
  starts.
