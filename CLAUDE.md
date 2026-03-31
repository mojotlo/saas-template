# CLAUDE.md

This is an AI-assisted JavaScript/TypeScript/Node.js project.

Read the following files before doing any work, in this order:

1. `ai/system-invariants.md` — rules that must never be violated
2. `ai/agent-bootstrap.md` — working process and task workflow
3. `ai/ai-guide.md` — architecture, layers, and dev strategy
4. `ai/repo-map.md` — where to find things in this repository
5. `ai/allowed-changes.md` — what you are and are not allowed to do

> **CRITICAL:** Read CLAUDE.md and all ai/ files listed above BEFORE any implementation.
> Do not skip this step. Every workflow violation in past sessions traces to skipping this.

---

## Quick Reference

### Commands
```bash
npm run dev        # start development server
npm test           # run test suite
npm run build      # production build
npm run lint       # lint check
npm run typecheck  # TypeScript type check
```

### Database Commands
```bash
npx prisma migrate dev      # create and apply a migration (development)
npx prisma migrate deploy   # apply migrations (production/CI)
npx prisma generate         # regenerate Prisma client after schema changes
npx prisma studio           # open database GUI
npx prisma db push          # push schema changes without a migration (prototyping only)
```

> Update these commands to match this project's actual package.json scripts.

### Stack
- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js
- **Package manager:** npm
- **Test framework:** Vitest
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui
- **Auth:** Clerk (`@clerk/nextjs`)
- **Payments:** Stripe (subscriptions, webhooks)
- **Database:** PostgreSQL via Neon + Prisma

### Key Rules (full details in ai/ files)
- Tests must pass after every change
- Never modify `node_modules/`, lock files, or deployment config without explicit instruction
- Keep files under 300 lines; 500 is the hard maximum
- Follow existing patterns — consistency over novelty
- When in doubt, stop and ask
- New libraries or architectural patterns require an ADR in `ai/decisions/` before implementation

---

## Session Workflow

Every feature or fix follows this loop. Do not skip steps.

```
/load-context    → read all ai/ files and confirm context is loaded (start of every session)
/spec            → turn a feature idea into a testable GitHub issue (plan mode)
Plan mode        → review spec, confirm approach before writing any code
Code mode        → execute the spec; loop until all tests pass
/simplify        → clean up code without changing behavior (only on green tests)
/verify          → start dev server, open browser, confirm app works end to end
/code-review     → catch anything missed; flag must-fix issues before committing
/commit-push-pr  → commit, push branch, open PR with description
/wrap-session    → capture session learnings, propose CLAUDE.md updates
```

### Rules for this loop
- Each spec should be small enough to complete in one session — split if unsure
- Never run /simplify on failing tests
- /verify may surface issues that send you back to code mode — that is expected
- /code-review is a first pass, not a substitute for reading the diff yourself
- The PR is the final human gate — review before merging
- GitHub Actions will run CI automatically on the PR (lint, typecheck, tests, Claude review)

---

## Working with GitHub Issues

Features and bugs are tracked as GitHub Issues. Each issue is a self-contained spec
that Claude Code can execute in Plan mode.

**To implement a feature:**
1. Find the issue number on GitHub (e.g. #12)
2. In Claude Code Plan mode: "Implement issue #12"
3. Claude reads the issue, plans the change, you approve
4. The PR body should include "Closes #12" to auto-close the issue on merge

**Issue templates** live in `.github/ISSUE_TEMPLATE/`:
- `feature.md` — new features with acceptance criteria
- `bug.md` — bugs with reproduction steps

**Priority labels:** P0 (critical), P1 (important), P2 (nice to have)

---

## Project Brief

This is a Next.js SaaS starter template with Clerk authentication and Stripe subscription billing.
It is meant to be cloned and customized — the business logic layer is intentionally minimal so
developers can layer in their own domain logic on top of the auth + billing foundation.

Key domain rules:
- Users are created/synced from Clerk via webhook (`api/webhooks/clerk`)
- Subscriptions are created/synced from Stripe via webhook (`api/webhooks/stripe`)
- `src/domain/subscription/subscription.ts` holds all access-control logic — no DB calls
- Money values are always integers in cents — use `src/domain/money/money.ts` for all monetary math

---

## Project-Specific Notes

**Third-party services:**
- Clerk (auth): https://clerk.com/docs — user management, social providers, webhooks
- Stripe (billing): https://stripe.com/docs — subscriptions, customer portal, webhooks
- Neon (database): https://neon.tech/docs — serverless Postgres, requires both pooled + direct URLs

**Non-obvious decisions:**
- The `User.id` in Prisma is the Clerk user ID (not a cuid) — this is intentional to avoid a join
- `stripeCustomerId` on User is set by the `checkout.session.completed` webhook, not at signup
- Plans are seeded manually into the DB — there is no admin UI for plan management yet
- Tailwind v4 is in use: theme variables are defined via `@theme` in `globals.css`, not `tailwind.config.ts`
- The `src/infrastructure/stripe/client.ts` singleton must be the only place Stripe is instantiated

**Webhook setup required:**
1. Clerk: add endpoint `POST /api/webhooks/clerk` — subscribe to `user.created`, `user.updated`, `user.deleted`
2. Stripe: add endpoint `POST /api/webhooks/stripe` — subscribe to `checkout.session.completed`, `customer.subscription.*`
3. Copy signing secrets into `.env` as `CLERK_WEBHOOK_SECRET` and `STRIPE_WEBHOOK_SECRET`

**Local webhook testing:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**SDK version discipline:**
- When using Clerk, Stripe, or any third-party SDK, verify the actual installed version's exports before writing code (`node -e "console.log(Object.keys(require('package')))"` or check the `.d.ts` files). Do not assume APIs from memory — they change between major versions.

**Slash commands:**
- Slash commands in `.claude/commands/` (e.g. `/load-context`, `/simplify`, `/verify`, `/code-review`, `/commit-push-pr`) can be executed by reading the command file and launching an Agent with those instructions. They are not available via the Skill tool.
