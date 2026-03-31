# SaaS Template

A Next.js SaaS starter with Clerk auth, Stripe subscriptions, and shadcn/ui — built for AI-assisted development with Claude Code.

---

## What's Included

- **Next.js 16** — App Router, React 19, Tailwind v4
- **Clerk auth** — sign-in/up, social providers, middleware, user sync webhook
- **Stripe subscriptions** — checkout, customer portal, webhook sync, monthly/annual plans
- **shadcn/ui** — Radix primitives styled with Tailwind (Button, Card, Badge, Separator)
- **Prisma + Neon** — PostgreSQL with User, Plan, Subscription models
- **Domain layer** — pure subscription access rules and monetary math
- **Integration tests** — subscription sync tested against real Postgres via Docker
- **Claude Code config** — slash commands, ADRs, CI with Claude code review

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/mojotlo/saas-template.git my-saas
cd my-saas
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in credentials from:
- **[Neon](https://neon.tech)** — `DATABASE_URL` (pooled) and `DIRECT_DATABASE_URL` (direct)
- **[Clerk](https://dashboard.clerk.com)** — publishable key, secret key, webhook secret
- **[Stripe](https://dashboard.stripe.com)** — secret key, webhook secret, price IDs

### 3. Set up the database

```bash
npx prisma migrate dev
```

### 4. Seed a plan

Create at least one Plan row with your Stripe price IDs. Example via Prisma Studio:

```bash
npx prisma studio
```

Or create a seed script at `prisma/seed.ts`.

### 5. Configure webhooks

**Clerk** (Dashboard → Webhooks):
- Endpoint: `https://your-domain.com/api/webhooks/clerk`
- Events: `user.created`, `user.updated`, `user.deleted`

**Stripe** (Dashboard → Webhooks):
- Endpoint: `https://your-domain.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

For local development:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 6. Run

```bash
npm run dev
```

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Sign-in, sign-up pages
│   ├── (marketing)/              # Landing page with pricing
│   ├── (dashboard)/              # Protected dashboard + billing settings
│   └── api/
│       ├── webhooks/clerk/       # User sync from Clerk
│       ├── webhooks/stripe/      # Subscription sync from Stripe
│       └── billing/              # Checkout + portal session endpoints
├── domain/
│   ├── money/                    # Pure monetary math (cents-based)
│   └── subscription/             # Access rules, billing interval logic
├── services/billing/             # Checkout, portal, subscription sync
├── infrastructure/
│   ├── database/client.ts        # Prisma singleton
│   └── stripe/client.ts          # Stripe singleton
├── components/ui/                # shadcn-style components
└── middleware.ts                 # Clerk auth — protects non-public routes

prisma/
├── schema.prisma                 # User, Plan, Subscription models
└── migrations/                   # Always commit these
```

Dependency direction: `infrastructure → services → domain`. Domain never imports from services or infrastructure.

---

## Commands

```bash
npm run dev              # Next.js dev server
npm run build            # production build
npm start                # serve production build
npm run typecheck        # TypeScript type check
npm run lint             # ESLint
npm test                 # unit tests (Vitest)
npm run test:coverage    # unit tests with coverage
npm run test:integration # integration tests (requires Docker)
npm run test:e2e         # end-to-end tests (Playwright)
```

```bash
npx prisma migrate dev       # create and apply a migration
npx prisma migrate deploy    # apply migrations in production
npx prisma generate          # regenerate client after schema changes
npx prisma studio            # open database GUI
```

---

## Subscription Flow

1. User signs up via Clerk → `user.created` webhook creates a `User` row
2. User clicks a plan on the pricing or billing page → API creates a Stripe Checkout Session
3. User completes checkout → `checkout.session.completed` saves `stripeCustomerId` on User
4. Stripe fires `customer.subscription.created` → subscription synced to DB
5. Dashboard reads subscription status via pure domain functions (`hasActiveAccess`, etc.)
6. User manages subscription via Stripe Customer Portal (`/api/billing/portal`)

---

## Development Workflow

```
Plan mode        → agree on spec before writing any code
Code mode        → implement; Claude loops until tests pass
/simplify        → clean up without changing behavior
/verify          → browser + tests confirm the app works
/code-review     → catch issues before committing
/commit-push-pr  → commit, push, open PR, monitor CI
```

---

## Parallel Development with Worktrees

```bash
npm run worktree:new 3       # creates worktree + branch for issue #3
npm run worktree:cleanup 3   # removes worktree after PR is merged
```

---

## CI

GitHub Actions runs on every PR: lint, typecheck, unit tests, integration tests, and Claude code review. Add `CLAUDE_CODE_OAUTH_TOKEN` as a repository secret and install the [Claude GitHub App](https://github.com/apps/claude).

---

## AI Context Files

| File | Purpose |
|---|---|
| `CLAUDE.md` | Entry point — stack, workflow, project notes |
| `ai/system-invariants.md` | Rules that must never be violated |
| `ai/agent-bootstrap.md` | Task workflow and planning process |
| `ai/ai-guide.md` | Architecture and implementation patterns |
| `ai/repo-map.md` | Where to find things in this repo |
| `ai/allowed-changes.md` | What Claude can and cannot change |
| `ai/decisions/` | Architecture Decision Records |
