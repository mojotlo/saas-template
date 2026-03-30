# Architecture Decision Records

This directory documents the key technical decisions made in this project.

Each ADR captures: what was decided, why, what alternatives were considered,
and when it should be revisited. These are living documents — update them
when a decision changes or new context emerges.

## Index

| ADR | Decision | Status | Revisit When |
|---|---|---|---|
| [ADR-001](ADR-001-database.md) | Database — Neon (PostgreSQL) | Accepted | $50+/mo, need RLS, want Supabase features |
| [ADR-002](ADR-002-orm.md) | ORM — Prisma | Accepted | Prisma v6 breaking changes, or perf issues |
| [ADR-003](ADR-003-auth.md) | Auth — Clerk | Accepted | MAU costs exceed $25/mo, or need self-hosted |
| [ADR-004](ADR-004-testing.md) | Testing — Vitest + Playwright | Accepted | Framework switch (Next.js, etc.) |
| [ADR-005](ADR-005-ci.md) | CI — GitHub Actions + Claude Review | Accepted | Team grows, need more sophisticated pipelines |

## How to use these

- **When starting a project:** review each ADR and update status/notes for your context
- **When making a new architectural decision:** create a new ADR before implementing
- **When a decision no longer holds:** update status to `Superseded` and link the new ADR
- **Claude Code:** if a task involves a new library, framework, or architectural pattern,
  create or update the relevant ADR as part of the task — do not implement without documenting
