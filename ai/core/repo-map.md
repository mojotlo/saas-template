# Repository Map (Core)

**Scope:** Where things are — layer locations, singletons, and change-type-to-location lookup.
Not for project facts or gotchas (that's `ai/core/project-notes.md`),
not for exact file paths or the full module table (that's `ai/supplementary/repo-map.md`).

---

## Layer Locations

| Layer | Path | What lives here |
|---|---|---|
| Domain | `src/domain/` | Pure business logic — no DB, no API calls |
| Services | `src/services/` | Orchestration — composes domain + infrastructure |
| Infrastructure | `src/infrastructure/` | Stripe, Prisma, external systems |
| UI / Routes | `src/app/` | Next.js App Router pages and API routes |
| Components | `src/components/ui/` | Shared UI components (shadcn pattern) |
| Tests | `tests/` + colocated | Vitest unit/integration, Playwright e2e |

## Critical Singletons

- Prisma: always import from `src/infrastructure/database/client.ts`
- Stripe: always import from `src/infrastructure/stripe/client.ts`

## Where to Make Changes

| Change type | Location |
|---|---|
| Business / access rules | `src/domain/` |
| Multi-step workflows | `src/services/` |
| DB queries, API calls | `src/infrastructure/` |
| New pages or API routes | `src/app/` |
| Shared components | `src/components/ui/` |

> Read `ai/supplementary/repo-map.md` when you need the full module table,
> exact file paths, or the external dependency list.
