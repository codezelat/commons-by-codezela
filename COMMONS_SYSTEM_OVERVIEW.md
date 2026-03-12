# Commons by Codezela System Overview

This file is intended to give a high-level overview of the Commons by Codezela system, its goals, features, and architecture. It is meant for anyone who wants to understand the product vision and how the system is designed to achieve it.

For full setup and engineering details, see [README.md](/Users/sayuru/Documents/GitHub/commons-by-codezela/README.md).

## 1. What this system is

**Commons by Codezela** is a technical publishing platform.

It is built for:

- students and freshers who need clear and trustworthy technical content
- senior engineers and specialists who want to publish serious work
- mentors, founders, and technical leaders who want to share lessons and insights

In one sentence:

**Commons by Codezela is a structured platform where credible people publish technical knowledge and learners discover it in a clean, trustworthy way.**

## 2. Main problem it solves

Many platforms have one strong side but also a big weakness:

- LinkedIn has reach, but deep technical reading is weak
- Medium supports long posts, but quality is inconsistent
- dev communities help with problem solving, but they are not ideal for strong author reputation or guided learning

Commons by Codezela fills that gap by combining:

- serious publishing
- quality control
- structured discovery
- a better reading experience

## 3. Product goal

The system should do two things well at the same time:

1. Help learners find useful and credible technical writing.
2. Help experienced contributors feel proud to publish on the platform.

This means the product should not feel like a noisy social app or a generic blog site.
It should feel like the space between a social network and a documentation platform.

## 4. Who the system is for

### Undergraduates and freshers

They want:

- easy-to-understand explanations
- practical examples
- trusted authors
- clear learning paths

They leave when:

- content quality is messy
- posts feel self-promotional
- it is hard to know what is credible

### Senior engineers and specialists

They want:

- strong professional identity
- a serious audience
- high-quality presentation
- good distribution of their work

They leave when:

- the feed feels low quality
- publishing feels clumsy
- the platform looks like student homework

### Entrepreneurs, mentors, and tech leads

They want:

- a place to share insights, postmortems, opinions, and lessons
- a thoughtful audience
- a clean writing workflow

## 5. Core product principles

Every major feature should improve at least one of these:

- trust
- discoverability
- contributor pride

The platform should always prefer:

- credibility before virality
- thoughtful community over noisy engagement
- structured learning over random content scrolling
- author ownership over platform lock-in
- visible quality, not just hidden admin work

## 6. What the system should feel like

For readers, Commons by Codezela should feel:

- calm
- useful
- trustworthy
- easy to read

For contributors, Commons by Codezela should feel:

- polished
- respected
- professional
- worth sharing publicly

## 7. Main features in this system

### Publishing

- rich text and Markdown article editor
- live writing and preview flow
- cover image support
- reading time calculation
- featured article section
- related article suggestions
- full-text search

### Moderation and quality control

- draft, pending, published, rejected, and archived states
- moderation queue for staff
- rejection feedback for authors
- re-review after edits to published articles
- policy and reporting pages
- audit logs for important staff actions

### Users and access

- email and password login
- Google and GitHub OAuth
- email verification
- password reset
- session management
- user banning for admins

### Taxonomy and discovery

- categories managed by staff
- community-submitted tags with approval flow
- topic-based content discovery
- author profiles and archives

### Engagement

- article reactions
- mobile haptic feedback
- audio feedback for reactions

## 8. User roles

### Reader

- write articles
- edit own content
- submit articles for review
- submit tag suggestions

### Moderator

- review and approve or reject articles
- review tags
- manage categories
- manage featured content

### Admin

- all moderator permissions
- manage users
- change roles
- ban or unban users
- view audit logs

## 9. Article workflow

The article flow is simple:

1. Author creates a draft.
2. Author submits it for review.
3. Moderator approves or rejects it.
4. Approved articles are published.
5. Rejected articles go back for revision.
6. Staff can archive content when needed.

This workflow is important because quality control is one of the platform's biggest value points.

## 10. Why senior contributors would use it

Senior contributors care about:

- professional reputation
- publishing in a high-signal environment
- being cited and shared
- helping serious learners
- low-friction writing tools

So the system should support them with:

- strong author identity
- clean profiles
- quality-focused moderation
- easy article creation
- good metadata and sharing support

## 11. High-level system architecture

The platform is built with a modern full-stack web setup:

- **Frontend:** Next.js App Router + React
- **Styling:** Tailwind CSS + shadcn/ui
- **Editor:** Tiptap
- **Auth:** Better Auth
- **Database:** PostgreSQL
- **Storage:** Cloudflare R2 or local file storage
- **Validation:** Zod

Main architectural choices:

- server components by default
- server actions for mutations
- direct parameterized SQL instead of an ORM
- role-based authorization
- database-backed audit and moderation support

## 12. Main data areas

The system mainly works around these data groups:

- users
- sessions and accounts
- articles
- categories
- tags
- article reactions
- audit logs
- rate-limit buckets

## 13. What makes this system different

Commons by Codezela should not compete by being louder.
It should compete by being clearer and more trustworthy.

Its strongest differentiators are:

- serious technical publishing
- guided discovery by topic and difficulty
- visible editorial quality
- a better environment for respected contributors
- a better learning experience for early-career readers

## 14. How success should be measured

Success is not just "more posts".

Better success signals are:

- strong repeat contributions from credible authors
- learners returning because they trust the content
- topic collections becoming deep and useful
- quality staying high as content volume grows
- people being able to describe the platform clearly in one sentence

## 15. Recommended short description

Use this when explaining the product quickly:

**Commons by Codezela is a moderation-first technical publishing platform where trusted contributors share real knowledge and learners discover it through a clean, structured reading experience.**

## 16. Bottom line

This system should be built and improved as a **credible technical knowledge platform**, not as a generic blog and not as a social content feed.

If a future feature does not improve trust, quality, discovery, or contributor reputation, it is probably not a priority.
