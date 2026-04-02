# CLAUDE.md

This is an AI-assisted JavaScript/TypeScript/Node.js project.

## Context files — what to read and when

### Always read at session start (core)

Run `/load-context` or read these four files manually before any work:

1. `ai/core/system-invariants.md` — absolute constraints that must never be violated
2. `ai/core/agent-bootstrap.md` — working process and TDD workflow
3. `ai/core/repo-map.md` — layer locations and critical singletons
4. `ai/core/project-notes.md` — project-specific facts Claude would otherwise get wrong

### Read on demand (supplementary)

Load these only when the task requires them:

- `ai/supplementary/ai-guide.md` — read before writing code, reviewing code, or creating a new module
- `ai/supplementary/allowed-changes.md` — read before starting any implementation task
- `ai/supplementary/repo-map.md` — read when you need exact file paths, module details, or the dependency list
- `ai/decisions/README.md` + relevant ADR — read when a task touches architecture or introduces a new dependency

> **CRITICAL:** Read core files before any work. Supplementary files are not optional when their
> trigger condition applies — skipping them is how architecture violations and out-of-scope work happen.

---

## Quick Reference

### Commands

See `package.json` scripts. Key commands: `npm test`, `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`.

### Stack
- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js
- **Package manager:** npm
- **Test framework:** Vitest
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui
- **Auth:** Clerk (`@clerk/nextjs`)
- **Payments:** Stripe (subscriptions, webhooks)
- **Database:** PostgreSQL via Neon + Prisma

---

## Session Workflow

Every feature or fix follows this loop. Do not skip steps.

```
/load-context    → read core ai/ files and confirm context is loaded (start of every session)
/spec            → turn a feature idea into a testable GitHub issue; offers to create worktree
Plan mode        → review spec, confirm approach before writing any code
Code mode        → execute the spec; loop until all tests pass
/simplify        → clean up code without changing behavior (only on green tests)
/verify          → typecheck, lint, tests, browser smoke test
/code-review     → catch anything missed; flag must-fix issues before committing
/commit-push-pr  → commit, push branch, open PR, monitor CI until green
/wrap-session    → write session log, propose CLAUDE.md updates for approval
```

Full workflow rules and subagent invocation order are in `ai/core/agent-bootstrap.md`.

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

> Project-specific facts and gotchas live in `ai/core/project-notes.md`.
