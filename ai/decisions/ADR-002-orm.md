# ADR-002: ORM — Prisma

**Status:** Accepted
**Date:** 2026-03-25
**Revisit when:** Prisma introduces breaking changes, performance bottlenecks emerge at scale, or Drizzle ecosystem matures further

---

## Decision

Use Prisma as the ORM for all database access.

---

## Why

- **Type safety** — generated client is fully typed from the schema; TypeScript strict mode works naturally with it
- **Migration as code** — `prisma migrate dev` generates versioned SQL migrations that are committed to git and repeatable
- **Architecture fit** — lives entirely in `src/infrastructure/database/`, domain and services layers never touch it directly
- **Ecosystem** — largest TypeScript ORM ecosystem, most tutorials and Stack Overflow answers assume it
- **Neon compatibility** — works out of the box with Neon, including the pooled/direct connection URL pattern

---

## Alternatives considered

| Option | Reason not chosen |
|---|---|
| **Drizzle ORM** | Promising, more lightweight, but smaller ecosystem and less mature migration tooling at time of decision |
| **TypeORM** | Older, more verbose, decorator-based patterns conflict with strict functional style |
| **Kysely** | Excellent type safety but requires writing raw SQL — more control than needed for most apps |
| **Raw SQL (pg)** | Maximum control but no migration tooling or type safety out of the box |

---

## Upgrade triggers

- Prisma v6+ introduces breaking changes → evaluate migration cost vs Drizzle
- App hits N+1 query performance issues Prisma can't solve → evaluate Kysely for specific hot paths
- Drizzle ecosystem reaches Prisma parity → reconsider on next greenfield project

---

## Key rules

- Always import from `src/infrastructure/database/client.ts`, never directly from `@prisma/client`
- Never use `prisma db push` in production — always `prisma migrate deploy`
- Run `prisma generate` after any schema change if not running a migration
- Commit `prisma/migrations/` — never gitignore it
