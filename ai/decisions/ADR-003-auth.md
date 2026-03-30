# ADR-003: Auth — Clerk

**Status:** Accepted (default recommendation — replace per project if needed)
**Date:** 2026-03-25
**Revisit when:** MAU costs exceed $25/month, need self-hosted auth, or project has no frontend

---

## Decision

Use Clerk as the default auth provider for React/Next.js projects.

---

## Why

- **Drop-in for React** — pre-built components for sign-in, sign-up, user profile; minimal custom code needed
- **Generous free tier** — 10,000 MAUs included, more than enough for most early-stage apps
- **Handles edge cases** — MFA, social login, org/team management, JWT, session management all included
- **Developer experience** — best-in-class DX for React/Next.js; consistently rated highest in developer surveys
- **Speed** — gets auth done in an afternoon, not a week

---

## Alternatives considered

| Option | Reason not chosen |
|---|---|
| **Supabase Auth** | Good but tightly coupled to Supabase platform; adds $25/project cost if using standalone |
| **Better Auth** | Open source, no MAU costs, self-hosted — better choice when vendor lock-in is a concern or project has no MAU constraints |
| **Auth.js (NextAuth)** | Battle-tested, free, self-hosted, but more manual setup and less polished than Clerk |
| **Firebase Auth** | Good MAU limits but Google ecosystem lock-in; less TypeScript-native |

---

## Upgrade triggers

- MAU costs consistently exceed $25/month → evaluate Better Auth (self-hosted, no MAU cost)
- Project needs HIPAA compliance → evaluate Auth0 or self-hosted Better Auth
- Project has no frontend (API-only) → use JWT directly or Better Auth
- Strong vendor independence requirement → migrate to Better Auth

---

## Migration path from Clerk to Better Auth

Better Auth can import existing user records. Migration involves:
1. Export users from Clerk dashboard
2. Set up Better Auth with same OAuth providers
3. Import users via Better Auth migration script
4. Update frontend auth hooks (similar API surface)

---

## Note on Supabase

If a project migrates from Neon to Supabase (see ADR-001), Supabase Auth becomes
a natural consideration. Evaluate at that point whether to also migrate auth or
keep Clerk running alongside Supabase's database.
