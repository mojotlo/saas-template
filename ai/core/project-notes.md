# Project Notes

**Scope:** Things that are true about this specific project that Claude would get wrong
from general knowledge alone. Read at session start alongside the other core files.
Add a note here whenever Claude makes the same mistake twice.

---

## Domain rules

- `User.id` in Prisma is the Clerk user ID (not a generated cuid) — intentional, avoids a join
- `stripeCustomerId` on User is set by the `checkout.session.completed` webhook, not at signup
- Plans are seeded manually into the DB — there is no admin UI for plan management
- Money values are always integers in cents — use `src/domain/money/money.ts` for all monetary math
- `src/domain/subscription/subscription.ts` holds all access-control logic — no DB calls

## Infrastructure rules

- Prisma client must always be imported from `src/infrastructure/database/client.ts` — never directly from `@prisma/client`
- Stripe must only be instantiated in `src/infrastructure/stripe/client.ts` — never create a second instance
- Always verify Clerk/Stripe SDK exports against the installed version before writing code — APIs change between major versions

## Styling

- Tailwind v4 is in use: theme variables are defined via `@theme` in `globals.css`, not in `tailwind.config.ts`

## Testing

- Unit tests cover domain logic only. The app layer (`src/app/`) is excluded from vitest coverage — UI features are verified via Playwright e2e, not component tests. Do not add `@testing-library/react` or jsdom without explicit instruction.

## Database migrations

- Use `migrate dev` in development, `migrate deploy` in CI/production
- Never use `db push` outside of prototyping
