# Copilot Instructions for commons-by-codezela

## Project Overview

**commons-by-codezela** is a full-stack content management and article publishing platform built with Next.js 16, React 19, and TypeScript. It features a rich text editor, user authentication, category/tag management, and flexible file storage.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 with CSS variables |
| Components | shadcn/ui (base-nova style) |
| Icons | Lucide React |
| Rich Text Editor | Tiptap v3 |
| Authentication | Better Auth v1.5 |
| Database | PostgreSQL (local or Supabase via `DB_PROVIDER=supabase`) |
| File Storage | AWS S3 / Cloudflare R2 |
| Notifications | Sonner (toast notifications) |
| Validation | Zod |
| Markdown | Remark / Rehype pipeline |

## Commands

```bash
# Development
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Database (local)
npm run db:push      # Push schema to local PostgreSQL
npm run db:seed      # Seed local database
npm run db:reset     # Reset local database

# Database (Supabase)
npm run db:push:live   # Push schema to Supabase
npm run db:seed:live   # Seed Supabase database
```

## Directory Structure

```
app/
  (auth)/            # Authentication pages (login, signup, forgot/reset password)
  (dashboard)/       # Protected dashboard routes (articles, categories, tags, featured)
  articles/          # Public article pages
  api/               # API routes (auth, upload, seed)

components/
  ui/                # shadcn/ui base components
  articles/          # Article-related components
  auth/              # Authentication UI components
  dashboard/         # Dashboard components
  editor/            # Tiptap rich text editor components
  site/              # Site-wide components (nav, header)

lib/
  actions/           # Next.js Server Actions (articles, featured, taxonomy)
  db.ts              # PostgreSQL connection
  auth.ts            # Better Auth server configuration
  auth-client.ts     # Better Auth client-side utilities
  schema.sql         # Database schema
  markdown.ts        # Markdown processing utilities
  upload.ts          # File upload handler (local / R2)
  r2.ts              # Cloudflare R2 integration
  article-metadata.ts
  editor-content.ts

types/               # Shared TypeScript type definitions
scripts/             # Database management scripts (db-push, db-seed, db-reset)
```

## Architecture Conventions

### Next.js App Router
- Use the **App Router** (`app/` directory) for all routes.
- Prefer **React Server Components (RSC)** by default; add `"use client"` only when browser APIs or interactivity is needed.
- Data fetching happens in Server Components or via **Server Actions** in `lib/actions/`.
- Route groups with parentheses (e.g., `(auth)`, `(dashboard)`) organise related routes without affecting the URL.

### TypeScript
- Strict TypeScript is enabled — always type function parameters and return values.
- Shared types live in the `types/` directory.
- Use path alias `@/` (maps to project root) for all imports.

### Components
- Add new shadcn/ui components using the CLI:
  ```bash
  npx shadcn@latest add <component-name>
  ```
- Place shadcn/ui primitives in `components/ui/`.
- Compose feature-specific components in their respective subdirectories (e.g., `components/articles/`).
- Use `lucide-react` for all icons.

### Styling
- Use **Tailwind CSS v4** utility classes.
- Global CSS variables and base styles are in `app/globals.css`.
- Use `cn()` from `@/lib/utils` to merge Tailwind class names conditionally.

### Authentication
- Authentication is handled by **Better Auth** — server config in `lib/auth.ts`, client in `lib/auth-client.ts`.
- Required environment variables: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.
- OAuth providers (Google, GitHub) are configured in `lib/auth.ts`.

### Database
- Use the `pg` client exported from `lib/db.ts` for all database queries.
- The database schema is defined in `lib/schema.sql`.
- Set `DB_PROVIDER=supabase` to target Supabase instead of a local PostgreSQL instance.

### File Uploads
- Upload logic lives in `lib/upload.ts` and `lib/r2.ts`.
- Supports local storage, AWS S3, and Cloudflare R2 depending on environment configuration.

### Server Actions
- All mutations (create, update, delete) use **Next.js Server Actions** located in `lib/actions/`.
- Server Actions call the database directly — no separate REST API layer.

### Notifications
- Use **Sonner** (`import { toast } from "sonner"`) for user-facing toast notifications.

### Validation
- Use **Zod** for runtime validation of forms and API inputs.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all required values before running the app:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `DB_PROVIDER` | `local` or `supabase` |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth sessions |
| `BETTER_AUTH_URL` | Public URL of the application |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth credentials |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` | Cloudflare R2 storage |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_BUCKET_NAME` | AWS S3 storage (alternative to R2) |

## Key Dependencies to Know

- `better-auth` — handles session management, OAuth, and email/password auth
- `@tiptap/*` — modular rich text editor extensions
- `react-markdown` + `remark-*` + `rehype-*` — Markdown rendering pipeline
- `shadcn` — component registry CLI
- `slugify` — generates URL-safe slugs for articles
- `zod` — schema validation
- `sonner` — toast notifications
- `date-fns` — date formatting utilities
- `mermaid` — diagram rendering inside articles
