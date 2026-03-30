# ADR-001: Database — Neon (PostgreSQL)

**Status:** Accepted
**Date:** 2026-03-25
**Revisit when:** Monthly costs exceed $50, need RLS or Supabase realtime, want pg_cron, or want the Supabase dashboard

---

## Decision

Use Neon serverless PostgreSQL as the default database, accessed via Prisma.

---

## Why

- **Economics for small apps** — scales to zero when idle, so dormant projects cost nothing
- **No per-project floor** — unlike Supabase's $25/project minimum, Neon's free tier supports up to 10 projects with no pausing on paid plans
- **Clean migration path** — both are standard Postgres; moving to Supabase is a connection string swap plus a `pg_dump`/`pg_restore`
- **Branching** — instant copy-on-write database branches for CI and preview environments; child branches cost essentially nothing for short-lived test runs
- **Databricks-backed** — acquired in 2026, compute costs dropped 15-25%, pricing trajectory is favorable

---

## Alternatives considered

| Option | Reason not chosen |
|---|---|
| **Supabase** | $25/project minimum makes it expensive to run many small apps; better as a graduation platform when a project needs its broader features |
| **Railway Postgres** | Good option but less developer tooling and no branching |
| **PlanetScale** | MySQL, not Postgres — breaks Prisma schema portability |
| **AWS RDS** | Overkill for small apps, no scale-to-zero, higher operational overhead |

---

## Upgrade triggers

- Project consistently uses $50+/month on Neon → evaluate Neon paid tier or migrate to Supabase
- Project needs Row Level Security (RLS) → migrate to Supabase
- Project needs cron jobs → Supabase pg_cron or add a separate scheduler
- Project needs Supabase realtime subscriptions → migrate to Supabase
- Want the Supabase dashboard for non-technical stakeholders → migrate to Supabase

---

## Migration path to Supabase

```bash
pg_dump $NEON_DATABASE_URL > backup.sql
# Create Supabase project, get connection string
psql $SUPABASE_DATABASE_URL < backup.sql
# Update DATABASE_URL and DIRECT_DATABASE_URL in .env
npx prisma migrate deploy
```
