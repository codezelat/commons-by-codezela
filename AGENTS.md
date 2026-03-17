# AGENTS.md

## Project Overview
- `commons-by-codezela` is a Next.js 16 App Router application using React 19, TypeScript, Tailwind CSS v4, shadcn/ui, and Better Auth.
- The product is a moderation-first publishing platform with public pages, auth flows, dashboard views, upload endpoints, and database-backed content workflows.
- Prefer small, surgical changes that fit the existing patterns already used in `app/`, `components/`, `lib/`, and `scripts/`.

## Stack And Architecture
- Framework: Next.js App Router with React Server Components by default.
- Styling: Tailwind CSS v4 with shadcn/ui components configured through `components.json`.
- Auth: Better Auth (`lib/auth.ts`, `lib/auth-client.ts`) with route handler at `app/api/auth/[...all]/route.ts`.
- Data access: direct PostgreSQL access through `pg`; no ORM.
- Business logic: shared server-side logic lives in `lib/` and `lib/actions/`.
- Uploads: handled through the upload route handlers and storage helpers in `lib/upload.ts`, `lib/r2.ts`, and `lib/local-upload.ts`.

## Working Agreements
- Check for deeper `AGENTS.md` files before editing files in subdirectories.
- Prefer Server Components; add `"use client"` only when browser APIs, local state, or client-only libraries require it.
- Keep mutations and privileged operations aligned with existing server-side patterns in `lib/actions/` and route handlers.
- Reuse existing utilities before adding new helpers.
- Keep TypeScript strictness intact; avoid `any` unless there is a clear, justified boundary.
- Do not introduce a new ORM, state library, CSS framework, or form library unless the user explicitly asks.
- Avoid broad refactors unless they are necessary for the requested task.

## File Map
- `app/`: routes, layouts, route handlers, and page-level composition.
- `components/`: reusable UI grouped by domain (`auth`, `dashboard`, `editor`, `site`, `ui`).
- `lib/`: shared infrastructure and domain utilities.
- `lib/actions/`: server-side domain actions for articles, users, taxonomy, featured content, reactions, audit, and home data.
- `scripts/`: database and local environment utilities.

## Commands
- Install deps: `npm install`
- Start dev server: `npm run dev`
- Build production app: `npm run build`
- Run linter: `npm run lint`
- Push database schema: `npm run db:push`
- Seed database: `npm run db:seed`
- Reset database: `npm run db:reset`
- Check R2 configuration: `npm run r2:check`

## Implementation Notes
- Follow existing naming and folder conventions instead of inventing new structure.
- When editing UI, prefer existing shadcn/ui primitives and local component patterns.
- When touching auth flows, preserve Better Auth configuration and existing cookie/session behavior.
- When touching database code, keep queries parameterized and colocate SQL-related logic with the current `lib/` patterns.
- Be careful with moderation, audit, and role logic; these are core product behaviors and should stay consistent.
- For uploads and environment-sensitive features, preserve the local fallback behavior and avoid hard-coding secrets or deployment-specific values.

## Validation
- For targeted changes, run the narrowest relevant check first.
- Minimum useful validation is usually `npm run lint`.
- Run `npm run build` when the change affects routing, server components, auth, or production behavior.
- If a task changes schema or seed behavior, use the existing `scripts/` commands instead of ad hoc one-off scripts.

## Safety
- Never commit secrets, `.env` files, local upload artifacts, or build output.
- Respect the existing `.gitignore` and keep generated files out of patches.
- If you find unrelated issues, note them briefly instead of fixing them opportunistically.
