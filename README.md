<p align="center">
  <img src="public/images/Frame 8.png" alt="Commons by Codezela" height="64" />
</p>

<h1 align="center">Commons by Codezela</h1>

<p align="center">
  <strong>An open-source platform for publishing and discovering research papers, technical articles, and peer-reviewed content.</strong>
</p>

<p align="center">
  Built by <a href="https://codezela.com">Codezela Technologies</a> &nbsp;·&nbsp; Powered by <a href="https://cca.it.com">Codezela Career Accelerator (CCA)</a>
</p>

<p align="center">
  <a href="https://github.com/codezelat/commons-by-codezela"><img src="https://img.shields.io/github/stars/codezelat/commons-by-codezela?style=flat&color=0f172a" alt="Stars" /></a>
  <a href="https://github.com/codezelat/commons-by-codezela"><img src="https://img.shields.io/github/forks/codezelat/commons-by-codezela?style=flat&color=0f172a" alt="Forks" /></a>
  <a href="https://github.com/codezelat/commons-by-codezela/issues"><img src="https://img.shields.io/github/issues/codezelat/commons-by-codezela?style=flat&color=0f172a" alt="Issues" /></a>
  <img src="https://img.shields.io/badge/License-MIT-0f172a?style=flat" alt="MIT License" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8?style=flat" alt="Tailwind CSS v4" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Setup (Automated)](#quick-setup-automated)
  - [Manual Setup](#manual-setup)
  - [Database Seeding](#database-seeding)
  - [Running the Dev Server](#running-the-dev-server)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Article Lifecycle & Moderation](#article-lifecycle--moderation)
- [Rich Text Editor](#rich-text-editor)
- [Taxonomy System](#taxonomy-system)
- [Reactions & Engagement](#reactions--engagement)
- [File Upload System](#file-upload-system)
- [SEO & Metadata](#seo--metadata)
- [Audit Trail](#audit-trail)
- [Rate Limiting](#rate-limiting)
- [Theming & Styling](#theming--styling)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [About Codezela](#about-codezela)

---

## Overview

**Commons by Codezela** is a moderation-first, full-stack content management and article publishing platform. It empowers researchers, writers, and technical authors to publish, discover, and engage with articles through a governed workflow — complete with editorial review, role-based access, and full audit transparency.

The platform is designed to bridge the gap between casual blogging and formal academic publishing — giving individual authors the freedom to write while ensuring every published piece meets community standards through a structured moderation pipeline.

Whether you're running an internal knowledge base, a community research journal, or a technical blog with multiple contributors, Commons provides the infrastructure to manage content at scale with integrity.

---

## Key Features

### Content Publishing

- **Rich Text + Markdown** — Dual-mode editor with live preview, powered by Tiptap v3
- **Full Article Lifecycle** — Draft → Pending Review → Published / Rejected / Archived
- **Cover Images** — Upload cover art for every article (5 MB max; JPEG, PNG, WebP, GIF, SVG)
- **Featured Articles** — Spotlight up to 3 articles in a curated carousel with drag-to-reorder
- **Full-Text Search** — PostgreSQL `tsvector`/`tsquery` indexed search with weighted title + content ranking
- **Reading Time** — Auto-calculated at ~220 words per minute
- **Related Articles** — Automatic same-category suggestions on article pages

### Moderation & Governance

- **Moderation Queue** — Dedicated review interface for pending submissions
- **Moderator Feedback** — Rejection notes sent back to authors for revision
- **Re-Moderation on Edit** — Published article edits trigger re-review
- **Comprehensive Audit Trail** — Every admin and moderator action is logged with structured metadata
- **Policy Pages** — Built-in Moderation Policy, Privacy Policy, Terms of Use, and Reporting pages

### User Management & Auth

- **Three Roles** — Reader, Moderator, Admin with granular permission boundaries
- **Email & Password** — Secure sign-up/login with bcrypt hashing (8–128 char passwords)
- **Email Verification** — Automatic verification email on sign-up with 24-hour expiry and auto sign-in after verification
- **OAuth** — Google and GitHub social login
- **Password Reset** — Email-based reset flow via Brevo (Sendinblue) transactional API
- **Session Management** — 7-day sessions, 1-day refresh age, 5-minute cookie cache
- **User Banning** — Admins can ban users with a reason and optional expiry date

### Taxonomy

- **Categories** — Staff-managed groupings with merge and delete support
- **Tags** — Community-driven with moderation: readers submit tags → staff approve/reject
- **Article–Tag Many-to-Many** — Flexible tagging with per-user permission filtering

### Engagement

- **Four Reaction Types** — 👍 Like, 💡 Insightful, ❤️ Inspiring, 🤔 Curious
- **Toggle Reactions** — One reaction per user per article; click again to remove
- **Synthesized Audio Feedback** — Web Audio API generates unique tones per reaction type
- **Haptic Feedback** — Mobile vibration patterns via the web-haptics library
- **Author Profiles** — Public author pages with article archive and category/tag filters

### Developer Experience

- **TypeScript Strict Mode** — Full type safety across the stack
- **Server Actions** — All mutations via Next.js Server Actions; no REST API layer
- **Parameterized SQL** — Direct PostgreSQL queries via `pg` with injection protection
- **Rate Limiting** — Token-bucket rate limiting on all user-facing mutations
- **Automatic Sitemap & Robots** — Dynamic XML sitemap with change frequency and priority

---

## Tech Stack

| Layer                | Technology                                                                              | Version |
| -------------------- | --------------------------------------------------------------------------------------- | ------- |
| **Framework**        | [Next.js](https://nextjs.org) (App Router)                                              | 16.1.6  |
| **Language**         | [TypeScript](https://www.typescriptlang.org) (strict mode)                              | 5.9.3   |
| **UI Library**       | [React](https://react.dev)                                                              | 19.2.3  |
| **Styling**          | [Tailwind CSS](https://tailwindcss.com) with CSS variables                              | v4      |
| **Components**       | [shadcn/ui](https://ui.shadcn.com) (base-nova style)                                    | v4      |
| **Icons**            | [Lucide React](https://lucide.dev)                                                      | 0.577.0 |
| **Rich Text Editor** | [Tiptap](https://tiptap.dev) with 25+ extensions                                        | v3      |
| **Authentication**   | [Better Auth](https://www.better-auth.com)                                              | 1.5.4   |
| **Database**         | [PostgreSQL](https://www.postgresql.org) (local or Supabase)                            | 17+     |
| **File Storage**     | [Cloudflare R2](https://www.cloudflare.com/r2) / Local fallback                         | —       |
| **Email**            | [Brevo](https://www.brevo.com) (transactional SMTP API)                                 | —       |
| **Validation**       | [Zod](https://zod.dev)                                                                  | v4      |
| **Notifications**    | [Sonner](https://sonner.emilkowal.ski)                                                  | —       |
| **Markdown**         | [Remark](https://remark.js.org) / [Rehype](https://github.com/rehypejs/rehype) pipeline | —       |
| **Diagrams**         | [Mermaid](https://mermaid.js.org)                                                       | —       |
| **Date Formatting**  | [date-fns](https://date-fns.org)                                                        | —       |
| **Haptics**          | [web-haptics](https://github.com/nicepkg/web-haptics)                                   | —       |

---

## Architecture

Commons follows the **Next.js App Router** paradigm with a clear separation of concerns:

```
┌──────────────────────────────────────────────────────────────────┐
│                        Browser / Client                          │
│                                                                  │
│   React 19 RSC + Client Components   ←→   shadcn/ui + Tiptap    │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                  Next.js 16 App Router                           │
│                                                                  │
│   Server Components (default)            API Routes              │
│   ├── Data fetching (direct SQL)         ├── /api/auth/*         │
│   ├── Metadata generation                ├── /api/upload         │
│   └── Layout composition                 ├── /api/uploads/*      │
│                                          └── /api/seed           │
│   Server Actions (lib/actions/)                                  │
│   ├── articles.ts    (CRUD + moderation)                         │
│   ├── taxonomy.ts    (categories + tags)                         │
│   ├── featured.ts    (featured articles)                         │
│   ├── reactions.ts   (article reactions)                         │
│   ├── users.ts       (user management)                           │
│   └── audit.ts       (audit log queries)                         │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Data Layer                                   │
│                                                                  │
│   lib/db.ts          ← pg Pool (parameterized queries)           │
│   lib/auth.ts        ← Better Auth (sessions + OAuth)            │
│   lib/authz.ts       ← Authorization guards                     │
│   lib/rate-limit.ts  ← Token-bucket rate limiting                │
│   lib/audit-log.ts   ← Structured audit logging                 │
│   lib/r2.ts          ← Cloudflare R2 (S3-compatible storage)     │
│   lib/email.ts       ← Brevo transactional email (verification + reset) │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                            │
│                                                                  │
│   user · session · account · verification                        │
│   article · category · tag · article_tag                         │
│   article_reaction · admin_audit_log · rate_limit_bucket         │
│                                                                  │
│   ✦ Full-text search (tsvector/GIN index)                        │
│   ✦ Auto-audit triggers (signup, login, logout, password reset, email verification) │
│   ✦ Database-level role constraints                              │
└──────────────────────────────────────────────────────────────────┘
```

**Key design decisions:**

- **React Server Components first** — `"use client"` only where browser APIs or interactivity is needed
- **No REST API layer for mutations** — All data writes go through Next.js Server Actions
- **Direct SQL** — No ORM; the `pg` library with parameterized queries for full control and safety
- **Session-based auth** — HTTP-only cookies with 5-minute cache for performance
- **Database-level audit triggers** — Signup, login, logout, and password changes are automatically logged at the PostgreSQL level

---

## Getting Started

### Prerequisites

| Tool           | Minimum Version | Notes                           |
| -------------- | --------------- | ------------------------------- |
| **Node.js**    | 18+             | LTS recommended                 |
| **npm**        | 9+              | Comes with Node.js              |
| **PostgreSQL** | 14+             | 17 recommended; or use Supabase |

**macOS:**

```bash
brew install node postgresql@17
brew services start postgresql@17
```

**Linux (Debian/Ubuntu):**

```bash
sudo apt install nodejs npm postgresql
sudo systemctl start postgresql
```

### Quick Setup (Automated)

The project includes an automated setup script that handles everything:

```bash
git clone https://github.com/codezelat/commons-by-codezela.git
cd commons-by-codezela

chmod +x scripts/setup-local.sh
./scripts/setup-local.sh
```

**The script will:**

1. Verify that PostgreSQL is installed and running
2. Create the `commons` database if it doesn't exist
3. Generate `.env.local` from `.env.example` with auto-detected connection strings
4. Generate a random `BETTER_AUTH_SECRET`
5. Install all npm dependencies
6. Push the database schema

After the script completes:

```bash
npm run dev        # Start the dev server
npm run db:seed    # Seed the admin user (in another terminal)
```

### Manual Setup

**1. Clone the repository:**

```bash
git clone https://github.com/codezelat/commons-by-codezela.git
cd commons-by-codezela
```

**2. Install dependencies:**

```bash
npm install
```

**3. Create your environment file:**

```bash
cp .env.example .env.local
```

**4. Configure your `.env.local`:**

```env
# Generate a secret
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Local PostgreSQL
DB_PROVIDER=local
DATABASE_URL_LOCAL=postgresql://postgres:postgres@localhost:5432/commons
```

**5. Create the database:**

```bash
createdb commons
```

**6. Push the schema:**

```bash
npm run db:push
```

### Database Seeding

Seed the initial admin user after the dev server is running:

```bash
# Start the server first
npm run dev

# In another terminal
npm run db:seed
```

This creates the admin account:

| Field        | Value               |
| ------------ | ------------------- |
| **Email**    | `info@codezela.com` |
| **Password** | `password`          |
| **Role**     | `admin`             |

> **Important:** Change the admin password immediately after first login in production.

### Running the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## Environment Variables

Copy `.env.example` to `.env.local` and configure the following:

### Required

| Variable              | Description                                                      |
| --------------------- | ---------------------------------------------------------------- |
| `BETTER_AUTH_SECRET`  | Session encryption key. Generate with `openssl rand -base64 32`  |
| `BETTER_AUTH_URL`     | Public URL of the application (e.g., `http://localhost:3000`)    |
| `NEXT_PUBLIC_APP_URL` | Public-facing base URL, used for metadata and sitemap generation |
| `DB_PROVIDER`         | `local` or `supabase` — determines which `DATABASE_URL_*` to use |
| `DATABASE_URL_LOCAL`  | PostgreSQL connection string for local development               |

### Database (Supabase)

| Variable                         | Description                                                                 |
| -------------------------------- | --------------------------------------------------------------------------- |
| `DATABASE_URL_SUPABASE_POOLER`   | Supabase pooler URL (recommended for Vercel/free tier and IPv4-only setups) |
| `DATABASE_URL_SUPABASE`          | Direct Supabase database URL (`db.<project-ref>.supabase.co`)               |

### Supabase Client (Optional)

| Variable                               | Description                           |
| -------------------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Project URL (`https://<ref>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key       |

### OAuth Providers (Optional)

| Variable               | Description                    |
| ---------------------- | ------------------------------ |
| `GOOGLE_CLIENT_ID`     | Google OAuth 2.0 client ID     |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret |
| `GITHUB_CLIENT_ID`     | GitHub OAuth app client ID     |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |

### Cloudflare R2 Storage (Optional)

| Variable               | Description                                 |
| ---------------------- | ------------------------------------------- |
| `R2_ACCOUNT_ID`        | Cloudflare account ID                       |
| `R2_ACCESS_KEY_ID`     | R2 API token access key                     |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret key                     |
| `R2_BUCKET_NAME`       | R2 bucket name (default: `commons-uploads`) |
| `R2_PUBLIC_URL`        | Public URL prefix for R2 assets (required when R2 is enabled) |

### Brevo Email (Optional in Development)

| Variable               | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| `BREVO_API_KEY`        | Brevo (Sendinblue) transactional API key                          |
| `BREVO_SENDER_EMAIL`   | Sender email address for transactional emails                     |
| `BREVO_SENDER_NAME`    | Sender display name (default: `Commons by Codezela Technologies`) |
| `BREVO_REPLY_TO_EMAIL` | Reply-to email address                                            |
| `BREVO_REPLY_TO_NAME`  | Reply-to display name                                             |

> **Note:** In development, if Brevo credentials are missing, password reset and email verification URLs are logged to the console instead of sent via email.

---

## Database Schema

The database is defined in [`lib/schema.sql`](lib/schema.sql) and consists of the following tables:

### Core Tables

| Table               | Description                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| `user`              | Users with email, name, image, role (`admin`/`moderator`/`reader`), ban status                      |
| `session`           | Token-based sessions with IP address and user agent tracking                                        |
| `account`           | OAuth provider accounts linked to users                                                             |
| `verification`      | Email verification and password reset tokens                                                        |
| `article`           | Articles with JSONB content, generated tsvector for full-text search, SEO fields, moderation status |
| `category`          | Article categories with name, slug, and description                                                 |
| `tag`               | Tags with moderation status (`approved`/`pending`/`rejected`), creator/reviewer attribution         |
| `article_tag`       | Many-to-many junction between articles and tags                                                     |
| `article_reaction`  | One reaction per user per article (type: `like`/`insightful`/`inspiring`/`curious`)                 |
| `admin_audit_log`   | Comprehensive audit trail with actor, action, target, and JSONB metadata                            |
| `rate_limit_bucket` | Token-bucket rate limiting counters per key and time window                                         |

### Indexes

The schema includes targeted indexes for performance:

- **`idx_article_search`** — GIN index on `search_vector` for full-text search
- **`idx_article_status`** — B-tree on `status` for filtering by publication state
- **`idx_article_author`** — B-tree on `author_id` for author-specific queries
- **`idx_article_category`** — B-tree on `category_id` for category filtering
- **`idx_article_featured`** — Partial index on `(is_featured, featured_order)` where `is_featured = TRUE`
- **`idx_article_published_at`** — Partial index on `published_at DESC` where `status = 'published'`
- **`idx_article_slug`** — B-tree on `slug` for URL lookups
- **`idx_article_pending_updated`** — Partial index on `updated_at DESC` where `status = 'pending'`
- **`idx_tag_status_created`** — Composite index on `(status, created_at DESC)` for moderation queue
- **`idx_article_reaction_article`** — B-tree on `article_id` for efficient reaction aggregation
- **`idx_admin_audit_log_created_at`** — B-tree on `created_at DESC` for chronological audit browsing

### Database Triggers

PostgreSQL triggers automatically log authentication events:

| Trigger                            | Event                                   | Logged Action                 |
| ---------------------------------- | --------------------------------------- | ----------------------------- |
| `trg_audit_auth_signup`            | `INSERT` on `user`                      | `auth.signup`                 |
| `trg_audit_session_created`        | `INSERT` on `session`                   | `auth.session.created`        |
| `trg_audit_session_revoked`        | `DELETE` on `session`                   | `auth.session.revoked`        |
| `trg_audit_password_updated`       | `UPDATE` on `account` (password change) | `auth.password.updated`       |
| `trg_audit_verification_requested` | `INSERT` on `verification`              | `auth.verification.requested` |

---

## Authentication

Authentication is handled by [Better Auth](https://www.better-auth.com) v1.5, configured in [`lib/auth.ts`](lib/auth.ts).

### Sign-Up & Login

- **Email/Password** — 8–128 character passwords, bcrypt hashed
- **Google OAuth** — One-click sign-in with Google accounts
- **GitHub OAuth** — One-click sign-in with GitHub accounts

### Email Verification

- A verification email is automatically sent on sign-up
- The verification link expires after 24 hours
- Users are automatically signed in after successful verification
- Branded HTML email template with fallback plain-text version

### Password Reset

- Users request a reset via the Forgot Password page
- A reset link is sent via the Brevo transactional email API
- The link directs to the Reset Password page where the user sets a new password
- In development mode without Brevo credentials, the reset URL is logged to the console

### Session Management

| Setting        | Value                             |
| -------------- | --------------------------------- |
| Session expiry | 7 days                            |
| Refresh age    | 1 day                             |
| Cookie cache   | 5 minutes                         |
| Secure cookies | Enabled in production             |
| Rate limit     | 30 requests per 60 seconds per IP |

### Auth Pages

| Page            | Route              | Description                      |
| --------------- | ------------------ | -------------------------------- |
| Login           | `/login`           | Email/password + OAuth login     |
| Sign Up         | `/signup`          | New account registration         |
| Forgot Password | `/forgot-password` | Request password reset email     |
| Reset Password  | `/reset-password`  | Set new password via reset token |

---

## Role-Based Access Control (RBAC)

Commons implements a three-tier role system defined in [`lib/roles.ts`](lib/roles.ts) and enforced by [`lib/authz.ts`](lib/authz.ts):

### Roles

| Role          | Description                                                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Reader**    | Default role. Can create articles, submit for review, submit new tags. Only sees own content and approved public content.           |
| **Moderator** | Can review and approve/reject articles and tags. Can manage categories, featured articles. Sees all articles regardless of author.  |
| **Admin**     | Full platform access. All Moderator privileges plus user management (role changes, bans), audit log access, and site configuration. |

### Permission Matrix

| Action                   | Reader | Moderator | Admin |
| ------------------------ | ------ | --------- | ----- |
| Create articles          | ✅     | ✅        | ✅    |
| Edit own articles        | ✅     | ✅        | ✅    |
| Edit any article         | ❌     | ✅        | ✅    |
| Submit for review        | ✅     | ✅        | ✅    |
| Publish directly         | ❌     | ✅        | ✅    |
| Approve/reject articles  | ❌     | ✅        | ✅    |
| Submit new tags          | ✅     | ✅        | ✅    |
| Approve/reject tags      | ❌     | ✅        | ✅    |
| Create categories        | ❌     | ✅        | ✅    |
| Manage featured articles | ❌     | ✅        | ✅    |
| View moderation queue    | ❌     | ✅        | ✅    |
| Manage users             | ❌     | ❌        | ✅    |
| View audit logs          | ❌     | ❌        | ✅    |
| Change user roles        | ❌     | ❌        | ✅    |
| Ban/unban users          | ❌     | ❌        | ✅    |

### Authorization Guards

The platform provides several server-side authorization utilities:

- **`getOptionalSession()`** — Returns the current session or `null`
- **`requireSession()`** — Throws `"Unauthorized"` if no session exists
- **`requireStaffSession()`** — Requires Moderator or Admin role
- **`requireAdminSession()`** — Requires Admin role
- **`canManageArticle(role, userId, authorId)`** — Staff can manage any article; readers only their own

---

## Article Lifecycle & Moderation

Articles go through a structured lifecycle from creation to publication:

```
  ┌─────────────────────────────────────────────────────────────────┐
  │                                                                 │
  │   ┌─────────┐    Submit    ┌──────────┐    Approve   ┌─────────┤
  │   │  Draft   │ ──────────→ │ Pending  │ ───────────→ │Published│
  │   └─────────┘             └──────────┘              └─────────┘
  │        ↑                       │                         │
  │        │                       │  Reject                 │  Edit
  │        │                       ▼                         │  (by reader)
  │        │                  ┌──────────┐                   │
  │        └──────────────── │ Rejected │                   │
  │         (revise & retry) └──────────┘                   │
  │                                                         │
  │                          ┌──────────┐                   │
  │                          │ Archived │ ←─────────────────┘
  │                          └──────────┘    (staff action)
  └─────────────────────────────────────────────────────────────────┘
```

### Statuses

| Status        | Description                                                                    |
| ------------- | ------------------------------------------------------------------------------ |
| **Draft**     | Work in progress. Only visible to the author and staff.                        |
| **Pending**   | Submitted for publication. Awaiting moderator review.                          |
| **Published** | Live and visible to the public. Appears in search, sitemap, and feeds.         |
| **Rejected**  | Returned to the author with moderator feedback. Reverts to draft for revision. |
| **Archived**  | Manually removed from public view by staff.                                    |

### Moderation Features

- **Review Queue** — Moderators see all pending articles sorted by submission date
- **Moderator Notes** — When rejecting, moderators provide feedback explaining why
- **Reviewer Attribution** — Every moderation decision records who reviewed and when
- **Re-Moderation** — When a reader edits a published article, its status reverts to pending for re-review
- **Force-Publish** — Staff members can publish their own articles without going through the queue

### Rate Limits

| Action                        | Reader Limit                | Staff Limit                 |
| ----------------------------- | --------------------------- | --------------------------- |
| Article creates/updates       | 40 per hour                 | 180 per hour                |
| Article submissions (pending) | 10 per day                  | Unlimited                   |
| Tag submissions               | 25 per day                  | 120 per day                 |
| File uploads                  | 25 per minute, 250 per hour | 25 per minute, 250 per hour |

---

## Rich Text Editor

The article editor is built on [Tiptap v3](https://tiptap.dev) with a comprehensive extension set, implemented in [`components/editor/block-editor.tsx`](components/editor/block-editor.tsx).

### Editor Modes

The editor supports two modes, switchable via tabs:

| Mode          | Description                                                          |
| ------------- | -------------------------------------------------------------------- |
| **Rich Text** | WYSIWYG editing with Tiptap, full formatting toolbar                 |
| **Markdown**  | Raw Markdown editing with live preview and Mermaid diagram rendering |

### Tiptap Extensions

The following extensions are loaded:

| Extension           | Capability                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `StarterKit`        | Paragraphs, bold, italic, strikethrough, code, blockquote, bullet/ordered lists, hard break, horizontal rule, headings (H1–H6) |
| `Underline`         | Underline text formatting                                                                                                      |
| `Link`              | Hyperlinks with `rel="noopener noreferrer nofollow"`                                                                           |
| `Image`             | Inline images with alignment (left/center/right) and width control                                                             |
| `TextAlign`         | Left, center, right, and justify alignment for headings and paragraphs                                                         |
| `Highlight`         | Colored text highlighting                                                                                                      |
| `Typography`        | Smart quotes, ellipsis, em-dash, and other typographic enhancements                                                            |
| `Superscript`       | Superscript text                                                                                                               |
| `Subscript`         | Subscript text                                                                                                                 |
| `TextStyle`         | Base for color and other text styling                                                                                          |
| `Color`             | Text color picker                                                                                                              |
| `CodeBlockLowlight` | Syntax-highlighted code blocks with language selection (40+ languages via lowlight/common)                                     |
| `Table`             | Tables with resizable columns                                                                                                  |
| `TableRow`          | Table row support                                                                                                              |
| `TableCell`         | Table cell support                                                                                                             |
| `TableHeader`       | Table header cells                                                                                                             |
| `Placeholder`       | Placeholder text: _"Start writing your article..."_                                                                            |
| `Markdown`          | Bidirectional Markdown ↔ ProseMirror conversion via tiptap-markdown                                                            |

### Toolbar Features

The [`EditorToolbar`](components/editor/editor-toolbar.tsx) provides:

- Block type selector (paragraph, H1–H6, blockquote, code block)
- Inline formatting (bold, italic, underline, strikethrough, code)
- Text color picker
- Highlight toggle
- Superscript / subscript
- Link insertion dialog
- Image upload dialog with alignment and dimension controls
- Table insertion (3-column, header/body rows)
- Text alignment (left, center, right, justify)
- Undo / redo
- Lists (bullet and ordered)
- Horizontal rule

### Bubble Menu

A floating bubble menu appears when selecting an image, offering:

- Alignment controls (left, center, right)
- Replace image
- Edit alt text
- Delete image

### Markdown Preview

When in Markdown mode, articles are processed through:

1. **remark-parse** → Parse Markdown to AST
2. **remark-gfm** → GitHub Flavored Markdown (tables, strikethrough, task lists)
3. **remark-breaks** → Line breaks as `<br>`
4. **remark-github-blockquote-alert** → GitHub-style alert blocks (Note, Tip, Important, Warning, Caution)
5. **remark-rehype** → Convert to HTML AST
6. **rehype-raw** → Allow raw HTML in Markdown
7. **rehype-sanitize** → Sanitize HTML for XSS protection
8. **rehype-stringify** → Render to HTML string
9. **Mermaid** → Client-side rendering of Mermaid diagram blocks

---

## Taxonomy System

### Categories

Categories provide top-level organization for articles:

- **Staff-only management** — Only Moderators and Admins can create, edit, or delete categories
- **Auto-slug generation** — URL-safe slugs generated from category names
- **Merge support** — Merge one category into another, transferring all articles
- **Delete safety** — Deleting a category nullifies the `category_id` on associated articles
- **Article counts** — Dashboard displays the number of articles per category

### Tags

Tags enable fine-grained content classification with a moderation workflow:

- **Community-driven** — Readers can submit new tags (status: `pending`)
- **Staff approval** — Moderators review and approve or reject submitted tags
- **Auto-approval for staff** — Tags created by Moderators/Admins are automatically approved
- **Moderation notes** — Rejected tags include feedback explaining the rejection
- **Creator/reviewer attribution** — Every tag records who created it and who reviewed it
- **Merge support** — Merge one tag into another, transferring all article associations
- **Permission-filtered** — Readers see only approved tags and their own pending submissions

---

## Reactions & Engagement

### Article Reactions

Readers can react to published articles with one of four types:

| Reaction       | Emoji | Audio Tone                                         |
| -------------- | ----- | -------------------------------------------------- |
| **Like**       | 👍    | Warm pop — sine wave sweeping 520 → 260 Hz         |
| **Insightful** | 💡    | Bright bell — 880 Hz with 1320 Hz harmonics        |
| **Inspiring**  | ❤️    | Warm chord — E4/Ab4/C5 triadic chord               |
| **Curious**    | 🤔    | Rising glide — triangle wave sweeping 340 → 680 Hz |
| _Remove_       | —     | Descending blip — 440 → 220 Hz                     |

- One reaction per user per article (clicking the same reaction toggles it off)
- Switching reactions replaces the previous one
- Unauthenticated users see a prompt to sign in
- Reaction counts are aggregated and displayed on article pages

### Audio Feedback

Reactions trigger synthesized audio feedback via the Web Audio API ([`lib/use-reaction-sound.ts`](lib/use-reaction-sound.ts)):

- Each reaction type has a unique tone signature
- Audio is generated client-side (no audio files needed)
- Removing a reaction plays a descending blip cue

### Haptic Feedback

On supported mobile devices, reactions trigger haptic vibration patterns via the [web-haptics](https://github.com/nicepkg/web-haptics) library:

- Success pattern on adding a reaction
- Warning pattern on removing a reaction
- Selection pattern for UI interactions

---

## File Upload System

### Upload Flow

1. User selects an image in the editor or cover image uploader
2. Client-side validation (type + size check)
3. `POST /api/upload` with `FormData`
4. Server-side validation + rate limiting
5. File stored in Cloudflare R2 (production) or local `.uploads/` directory (development)
6. Public URL returned to the client

### Storage Backends

| Backend              | When Used                          | Configuration                                            |
| -------------------- | ---------------------------------- | -------------------------------------------------------- |
| **Cloudflare R2**    | When `R2_ACCOUNT_ID` is configured | S3-compatible API via `@aws-sdk/client-s3`               |
| **Local filesystem** | Fallback when R2 is not configured | Files stored in `.uploads/`, served via `/api/uploads/*` |

### Constraints

| Constraint            | Value                               |
| --------------------- | ----------------------------------- |
| Maximum file size     | 5 MB                                |
| Allowed types         | JPEG, PNG, WebP, GIF, SVG           |
| Rate limit (per user) | 25 uploads per minute, 250 per hour |
| Filename format       | UUID-based random filenames         |

### Image Component

The [`ManagedImage`](components/ui/managed-image.tsx) component handles rendering:

- Uses Next.js `Image` with `unoptimized` for local/data URIs
- Automatically remaps legacy `/uploads/` paths to `/api/uploads/`
- Responsive `srcSet` and sizing

---

## SEO & Metadata

### Per-Article SEO Fields

Every article supports customizable SEO metadata:

| Field             | Description                                                   |
| ----------------- | ------------------------------------------------------------- |
| `seo_title`       | Custom title for search engines (falls back to article title) |
| `seo_description` | Custom meta description (auto-derived from content if blank)  |
| `seo_image`       | Custom Open Graph image (falls back to cover image)           |
| `canonical_url`   | Canonical URL for syndicated content                          |
| `robots_noindex`  | Flag to exclude from search engine indexing                   |

### Structured Data

Article pages include **JSON-LD** structured data compliant with the [schema.org Article schema](https://schema.org/Article):

- `headline`, `description`, `image`
- `datePublished`, `dateModified`
- `author` with `name` and `url`
- `publisher` with organization details
- Canonical URL

### Open Graph & Twitter Cards

Full Open Graph metadata is generated for every article page:

- `og:title`, `og:description`, `og:image`, `og:type`
- `og:url`, `og:site_name`
- Twitter card metadata

### Sitemap

The [`app/sitemap.ts`](app/sitemap.ts) dynamically generates an XML sitemap including:

- Homepage (`priority: 1.0`, `changeFrequency: weekly`)
- Articles listing (`priority: 0.9`, `changeFrequency: daily`)
- Every published article (with `lastModified` from `updated_at`)
- Author profile pages
- Legal pages (Moderation Policy, Privacy, Terms, Reporting)

Only articles with `status = 'published'` and `robots_noindex = false` are included.

### Robots.txt

The [`app/robots.ts`](app/robots.ts) generates a standard `robots.txt` allowing all crawlers and pointing to the sitemap.

---

## Audit Trail

Every significant action in the platform is logged to the `admin_audit_log` table:

### Logged Actions

| Action                          | Target         | When                                                  |
| ------------------------------- | -------------- | ----------------------------------------------------- |
| `auth.signup`                   | `user`         | New user registration                                 |
| `auth.session.created`          | `session`      | User login                                            |
| `auth.session.revoked`          | `session`      | User logout                                           |
| `auth.password.updated`         | `account`      | Password change                                       |
| `auth.verification.requested`   | `verification` | Email verification or password reset request          |
| `article.created`               | `article`      | New article created                                   |
| `article.updated`               | `article`      | Article content or metadata edited                    |
| `article.status_changed`        | `article`      | Status transition (draft → pending → published, etc.) |
| `featured.added`                | `article`      | Article added to featured carousel                    |
| `featured.removed`              | `article`      | Article removed from featured carousel                |
| `featured.reordered`            | `article`      | Featured article order changed                        |
| `tag.moderated`                 | `tag`          | Tag approved or rejected                              |
| `user.role_changed`             | `user`         | User role modified                                    |
| `user.banned` / `user.unbanned` | `user`         | User ban status changed                               |

### Audit Log Entry Structure

```json
{
  "id": "uuid",
  "actor_id": "user-uuid",
  "actor_role": "admin",
  "action": "article.status_changed",
  "target_type": "article",
  "target_id": "article-uuid",
  "target_label": "Article Title",
  "metadata": {
    "old_status": "pending",
    "new_status": "published"
  },
  "created_at": "2026-01-15T10:30:00Z"
}
```

### Dashboard Access

Admins can browse the audit log at `/dashboard/audit` with:

- Full-text search across action types, actor names, and target labels
- Filtering by action type and target type
- Paginated, chronologically sorted results

---

## Rate Limiting

Rate limiting is implemented via a **token-bucket algorithm** backed by PostgreSQL ([`lib/rate-limit.ts`](lib/rate-limit.ts)):

### How It Works

1. Each rate limit is identified by a **hashed key** (SHA-256 of user ID + action)
2. Requests are grouped into **time buckets** (e.g., 1-hour or 1-day windows)
3. Each request increments the counter via `INSERT ... ON CONFLICT DO UPDATE`
4. If the counter exceeds the limit, a `RateLimitError` is thrown with a `retryAfterSeconds` value
5. Stale buckets are cleaned up probabilistically (2% chance on each request)

### Applied Limits

| Action                    | Key                       | Limit | Window     |
| ------------------------- | ------------------------- | ----- | ---------- |
| Article writes (reader)   | `article-write:{userId}`  | 40    | 1 hour     |
| Article writes (staff)    | `article-write:{userId}`  | 180   | 1 hour     |
| Article submissions       | `article-submit:{userId}` | 10    | 1 day      |
| Tag submissions (reader)  | `tag-submit:{userId}`     | 25    | 1 day      |
| Tag submissions (staff)   | `tag-submit:{userId}`     | 120   | 1 day      |
| File uploads (per minute) | `upload-min:{userId}`     | 25    | 1 minute   |
| File uploads (per hour)   | `upload-hr:{userId}`      | 250   | 1 hour     |
| Auth requests             | IP-based via Better Auth  | 30    | 60 seconds |

---

## Theming & Styling

### Color System

The platform uses the **OKLCh color space** for perceptually uniform colors across light and dark modes. All colors are defined as CSS custom properties in [`app/globals.css`](app/globals.css):

- Light and dark mode variants for every semantic color
- Sidebar-specific color palette
- Chart colors for data visualization
- Destructive/error states

### Dark Mode

Full dark mode support via CSS classes (`.dark`), with colors recalculated for equal perceptual contrast.

### Typography

| Font            | Usage                                              | Source         |
| --------------- | -------------------------------------------------- | -------------- |
| **DM Sans**     | Body text, UI elements                             | Google Fonts   |
| **Lora**        | Display headings, editorial accents (serif italic) | Google Fonts   |
| **System Mono** | Code blocks, monospace content                     | System default |

### Animations

- **`pub-fade-in`** — Fade-in animation for page transitions
- **`pub-fade-in-d1`** — Delayed staggered fade for sequential elements

### Syntax Highlighting

Code blocks use a custom dark theme with carefully chosen colors:

- **Keywords** — Pink (`#f472b6`)
- **Strings** — Green (`#86efac`)
- **Numbers** — Amber (`#fbbf24`)
- **Functions** — Sky blue (`#7dd3fc`)
- **Comments** — Slate (`#94a3b8`)
- **Meta/Doctags** — Violet (`#c4b5fd`)

### Component Library

Built on [shadcn/ui](https://ui.shadcn.com) with the **base-nova** preset. Components include:

Alert Dialog, Avatar, Badge, Button, Card, Checkbox, Command, Dialog, Dropdown Menu, Input, Label, Pagination, Popover, Scroll Area, Select, Separator, Sheet, Skeleton, Switch, Table, Tabs, Textarea, Toggle, Toggle Group, Tooltip, and more.

---

## Project Structure

```
commons-by-codezela/
├── app/                              # Next.js App Router
│   ├── globals.css                   # Global styles, OKLCh theme, syntax highlighting
│   ├── layout.tsx                    # Root layout (fonts, Toaster, TooltipProvider)
│   ├── page.tsx                      # Homepage — hero section
│   ├── robots.ts                     # Dynamic robots.txt generation
│   ├── sitemap.ts                    # Dynamic XML sitemap generation
│   │
│   ├── (auth)/                       # Auth route group
│   │   ├── layout.tsx                # Auth layout (centered, minimal)
│   │   ├── login/page.tsx            # Login page
│   │   ├── signup/page.tsx           # Registration page
│   │   ├── forgot-password/page.tsx  # Password reset request
│   │   └── reset-password/page.tsx   # Password reset form
│   │
│   ├── (dashboard)/                  # Protected dashboard route group
│   │   ├── layout.tsx                # Dashboard layout (sidebar + shell)
│   │   └── dashboard/
│   │       ├── page.tsx              # Dashboard overview
│   │       ├── articles/             # Article management pages
│   │       ├── categories/           # Category CRUD
│   │       ├── tags/                 # Tag management + moderation
│   │       ├── featured/             # Featured articles management
│   │       ├── moderation/           # Moderation queue
│   │       ├── users/                # User management (admin)
│   │       └── audit/                # Audit log viewer (admin)
│   │
│   ├── articles/                     # Public article pages
│   │   ├── page.tsx                  # Article listing with search + filters
│   │   └── [slug]/page.tsx           # Individual article page
│   │
│   ├── authors/[id]/page.tsx         # Public author profile page
│   │
│   ├── api/                          # API routes
│   │   ├── auth/[...all]/route.ts    # Better Auth catch-all handler
│   │   ├── upload/route.ts           # Image upload endpoint
│   │   ├── uploads/[...path]/route.ts # Local file serving endpoint
│   │   └── seed/route.ts             # Admin user seeding endpoint
│   │
│   ├── moderation-policy/page.tsx    # Moderation policy page
│   ├── privacy/page.tsx              # Privacy policy page
│   ├── terms/page.tsx                # Terms of use page
│   └── reporting/page.tsx            # Content reporting page
│
├── components/
│   ├── ui/                           # shadcn/ui base components
│   │   ├── button.tsx, card.tsx, dialog.tsx, ...
│   │   └── managed-image.tsx         # Smart image component with URL normalization
│   │
│   ├── articles/                     # Article feature components
│   │   ├── article-body.tsx          # Article content renderer
│   │   ├── article-card.tsx          # Article preview card
│   │   └── article-reactions.tsx     # Reaction buttons + counts
│   │
│   ├── auth/                         # Auth form components
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   ├── forgot-password-form.tsx
│   │   └── reset-password-form.tsx
│   │
│   ├── dashboard/                    # Dashboard feature components
│   │   ├── dashboard-shell.tsx       # Dashboard layout shell (sidebar + nav)
│   │   ├── articles/                 # Article management components
│   │   ├── categories/               # Category management components
│   │   ├── tags/                     # Tag management components
│   │   ├── featured/                 # Featured articles components
│   │   ├── moderation/               # Moderation queue components
│   │   ├── users/                    # User management components
│   │   └── audit/                    # Audit log components
│   │
│   ├── editor/                       # Rich text editor
│   │   ├── block-editor.tsx          # Main Tiptap editor component
│   │   ├── editor-toolbar.tsx        # Formatting toolbar
│   │   ├── image-upload-dialog.tsx   # Image upload modal
│   │   └── markdown-preview.tsx      # Markdown preview renderer
│   │
│   └── site/                         # Site-wide components
│       ├── public-shell.tsx          # Public pages layout (header + footer)
│       ├── pub-theme-provider.tsx    # Theme context provider
│       └── pub-theme-toggle.tsx      # Dark/light mode toggle
│
├── lib/                              # Core business logic
│   ├── db.ts                         # PostgreSQL Pool + query helpers
│   ├── auth.ts                       # Better Auth server configuration
│   ├── auth-client.ts                # Better Auth client-side utilities
│   ├── authz.ts                      # Authorization guards (requireSession, etc.)
│   ├── roles.ts                      # Role definitions and helpers
│   ├── rate-limit.ts                 # Token-bucket rate limiting
│   ├── audit-log.ts                  # Structured audit log writer
│   ├── email.ts                      # Brevo transactional email (verification + reset)
│   ├── upload.ts                     # Client-side upload helpers + validation
│   ├── r2.ts                         # Cloudflare R2 storage integration
│   ├── local-upload.ts               # Local filesystem upload fallback
│   ├── markdown.ts                   # Remark/Rehype Markdown processing pipeline
│   ├── editor-content.ts             # Editor content type resolution
│   ├── article-metadata.ts           # SEO metadata derivation for articles
│   ├── use-reaction-sound.ts         # Web Audio API reaction sound synthesis
│   ├── utils.ts                      # Utility functions (cn, etc.)
│   ├── schema.sql                    # Full database schema DDL
│   │
│   └── actions/                      # Next.js Server Actions
│       ├── articles.ts               # Article CRUD, moderation, search
│       ├── taxonomy.ts               # Category + tag management
│       ├── featured.ts               # Featured articles operations
│       ├── reactions.ts              # Article reaction toggle
│       ├── reaction-types.ts         # Shared reaction type constants
│       ├── users.ts                  # User management (roles, bans)
│       └── audit.ts                  # Audit log queries
│
├── types/                            # Shared TypeScript type definitions
│   └── markdown-it-task-lists.d.ts
│
├── scripts/                          # Database management scripts
│   ├── setup-local.sh                # Automated local setup script
│   ├── db-push.ts                    # Push schema.sql to database
│   ├── db-seed.ts                    # Seed admin user
│   └── db-reset.ts                   # Drop all tables + re-push + re-seed
│
├── public/uploads/                   # Legacy public upload directory
│
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript (strict mode) configuration
├── eslint.config.mjs                 # ESLint configuration
├── postcss.config.mjs                # PostCSS configuration
├── components.json                   # shadcn/ui configuration (base-nova)
├── package.json                      # Dependencies and scripts
└── .env.example                      # Environment variable template
```

---

## Available Scripts

| Script                     | Command                | Description                                          |
| -------------------------- | ---------------------- | ---------------------------------------------------- |
| **Dev Server**             | `npm run dev`          | Start Next.js development server on `localhost:3000` |
| **Build**                  | `npm run build`        | Create production build                              |
| **Start**                  | `npm run start`        | Start production server                              |
| **Lint**                   | `npm run lint`         | Run ESLint                                           |
| **Push Schema (Local)**    | `npm run db:push`      | Push `schema.sql` to local PostgreSQL                |
| **Push Schema (Supabase)** | `npm run db:push:live` | Push `schema.sql` to Supabase PostgreSQL             |
| **Seed (Local)**           | `npm run db:seed`      | Seed admin user on local database                    |
| **Seed (Supabase)**        | `npm run db:seed:live` | Seed admin user on Supabase database                 |
| **Reset Database**         | `npm run db:reset`     | Drop all tables, re-push schema, re-seed             |
| **R2 Health Check**        | `npm run r2:check`     | Verify R2 API access, upload/delete, and public URL  |

---

## Deployment

### Vercel (Recommended)

1. Push your repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Configure the environment variables in the Vercel dashboard:
   - All variables from [Environment Variables](#environment-variables) section
   - Set `DB_PROVIDER=supabase` and `DATABASE_URL_SUPABASE_POOLER` for Supabase
   - Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production domain
4. Deploy

### Supabase Database Setup

1. Create a new project in [Supabase](https://supabase.com)
2. Copy the pooler connection string from Settings → Database (free tier: use Supavisor/Pooler URL)
3. Set `DB_PROVIDER=supabase` and `DATABASE_URL_SUPABASE_POOLER` in your environment
4. Push the schema:
   ```bash
   npm run db:push:live
   ```
5. Seed the admin user:
   ```bash
   npm run db:seed:live
   ```

### Cloudflare R2 Setup

1. Create a bucket (e.g., `commons-up`)
2. Create API credentials:
   - Go to R2 → Manage R2 API tokens → Create API token
   - Permissions: `Object Read` + `Object Write`
   - Scope: at least the target bucket
   - Copy `Access Key ID` and `Secret Access Key`
3. Configure environment variables:
   - `R2_ACCOUNT_ID` (from the S3 API endpoint host prefix)
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `R2_PUBLIC_URL`
4. Configure public delivery (one option):
   - Enable **Public Development URL** for quick testing, then set `R2_PUBLIC_URL` to that URL
   - Or configure a **Custom Domain** and set `R2_PUBLIC_URL` to `https://your-domain`
5. Verify end-to-end:
   ```bash
   npm run r2:check
   ```

### Brevo Email Setup

1. Create a [Brevo](https://www.brevo.com) account
2. Generate a transactional API key
3. Verify your sender email address
4. Configure the `BREVO_*` environment variables

---

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following the project conventions:
   - TypeScript strict mode — type all function parameters and return values
   - Use `@/` path alias for imports
   - Use Server Components by default; `"use client"` only when needed
   - Use Server Actions for mutations (in `lib/actions/`)
   - Use `pg` parameterized queries — never interpolate user input into SQL
   - Use Sonner for toast notifications
   - Use Zod for input validation
   - Use `cn()` from `@/lib/utils` for conditional class names
4. **Test** your changes thoroughly
5. **Submit a Pull Request** with a clear description of what you changed and why

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for the full text.

---

## About Codezela

**[Codezela Technologies](https://codezela.com)** is a software engineering company dedicated to building open-source tools and platforms that empower developers, researchers, and creators.

**Commons** is powered by the **[Codezela Career Accelerator (CCA)](https://cca.it.com)** — an initiative focused on accelerating technology careers through hands-on project experience, open-source contributions, and knowledge sharing.

---

<p align="center">
  <sub>Built with ❤️ by <a href="https://codezela.com">Codezela Technologies</a></sub>
</p>
