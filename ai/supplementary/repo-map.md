# Repository Map (Full)

**Scope:** The complete codebase reference — exact file paths, module table, entry points,
frozen areas, and dependency list. This is a reference document, not instructional.
The distinction from `ai/core/project-notes.md`: that file contains facts about how
the project works; this file contains facts about where things live.
For quick orientation, `ai/core/repo-map.md` is sufficient.

---

## Directory Structure

```
/
├── CLAUDE.md                         # AI entry point — read first
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind v4 (minimal — theme is in globals.css)
├── postcss.config.js                 # Uses @tailwindcss/postcss
├── .claude/                          # Claude Code configuration
│   ├── settings.json
│   └── commands/
├── .github/workflows/ci.yml          # lint, typecheck, test, Claude review
├── ai/
│   ├── core/                         # Always-read context files
│   ├── supplementary/                # Read on demand (see CLAUDE.md for when)
│   ├── decisions/                    # ADRs — read when touching architecture
│   └── sessions/                     # Planning notes from /spec sessions
├── prisma/
│   ├── schema.prisma                 # User, Plan, Subscription models
│   └── migrations/                   # Migration history — always commit
├── src/
│   ├── middleware.ts                  # Clerk auth middleware — protects all non-public routes
│   ├── lib/
│   │   └── utils.ts                  # cn() helper for Tailwind class merging
│   ├── components/
│   │   └── ui/                       # shadcn-style components (Button, Card, Badge, etc.)
│   ├── domain/
│   │   ├── invoice/                  # Invoice mapping — RawInvoiceData → InvoiceRow
│   │   ├── money/                    # Pure monetary math (Money type, formatMoney, etc.)
│   │   ├── plan/                     # Plan input validation + feature parsing
│   │   ├── subscription/             # Subscription access rules (hasActiveAccess, etc.)
│   │   └── user/                     # User row mapping, status labels, dashboard URLs
│   ├── services/
│   │   ├── admin/
│   │   │   └── planService.ts        # Plan CRUD orchestration (validation + Stripe + DB)
│   │   └── billing/
│   │       ├── checkoutService.ts    # Creates Stripe Checkout Session
│   │       ├── portalService.ts      # Creates Stripe Customer Portal session
│   │       └── subscriptionSyncService.ts  # Syncs Stripe subscription → DB
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── client.ts             # Prisma singleton — always import from here
│   │   │   └── user-queries.ts       # Fetches all users with subscription + plan
│   │   └── stripe/
│   │       ├── client.ts             # Stripe singleton — always import from here
│   │       ├── invoices.ts           # Fetches invoices from Stripe API
│   │       └── prices.ts             # Fetches active recurring prices, validates price IDs
│   └── app/                          # Next.js App Router
│       ├── layout.tsx                # Root layout — ClerkProvider wraps everything
│       ├── globals.css               # Tailwind v4 @theme + CSS variable definitions
│       ├── (auth)/
│       │   ├── sign-in/[[...sign-in]]/page.tsx
│       │   └── sign-up/[[...sign-up]]/page.tsx
│       ├── (marketing)/
│       │   ├── layout.tsx            # Public nav header + footer
│       │   └── page.tsx              # Landing + pricing page
│       ├── (dashboard)/
│       │   ├── layout.tsx            # Sidebar nav + user button
│       │   ├── dashboard/page.tsx    # Dashboard home
│       │   ├── admin/users/
│       │   │   ├── page.tsx          # Admin user list (Server Component)
│       │   │   └── user-table.tsx    # User table with search + status filter
│       │   └── settings/billing/
│       │       ├── page.tsx              # Billing management + plan upgrade
│       │       └── invoices/page.tsx     # Invoice history (Server Component)
│       └── api/
│           ├── webhooks/
│           │   ├── clerk/route.ts    # Syncs users from Clerk (user.created/updated/deleted)
│           │   └── stripe/route.ts   # Syncs subscriptions from Stripe
│           ├── admin/
│           │   ├── stripe-prices/route.ts  # GET → active recurring Stripe prices
│           │   └── plans/
│           │       ├── route.ts      # POST → create plan
│           │       └── [id]/route.ts # PUT → update plan, DELETE → delete plan
│           └── billing/
│               ├── checkout/route.ts # POST → returns Stripe Checkout URL
│               └── portal/route.ts   # POST → returns Stripe Portal URL
└── tests/                            # Test suite (colocated tests also in src/)
```

---

## Where to Make Changes

| Type of change | Location |
|---|---|
| Subscription access rules | `src/domain/subscription/subscription.ts` |
| Plan validation | `src/domain/plan/plan.ts` |
| Plan CRUD orchestration | `src/services/admin/planService.ts` |
| Monetary calculations | `src/domain/money/money.ts` |
| Checkout / portal flow | `src/services/billing/` |
| Stripe API calls | `src/infrastructure/stripe/client.ts` + services |
| DB queries | `src/infrastructure/database/client.ts` (Prisma) |
| New pages / routes | `src/app/` |
| Reusable UI components | `src/components/ui/` |
| Auth protection rules | `src/middleware.ts` |

---

## Key Modules

| Module | Path | Responsibility |
|---|---|---|
| Money | `src/domain/money/money.ts` | Pure monetary math — all amounts in cents |
| Subscription | `src/domain/subscription/subscription.ts` | Access control rules — no DB calls |
| CheckoutService | `src/services/billing/checkoutService.ts` | Creates Stripe Checkout Session |
| PortalService | `src/services/billing/portalService.ts` | Creates Stripe Customer Portal session |
| SubscriptionSync | `src/services/billing/subscriptionSyncService.ts` | Upserts subscription from Stripe webhook |
| Plan (domain) | `src/domain/plan/plan.ts` | Plan input validation, feature parsing — pure, no DB/Stripe |
| Plan (service) | `src/services/admin/planService.ts` | Orchestrates plan CRUD: domain validation + Stripe verification + DB |
| User (domain) | `src/domain/user/user.ts` | User row mapping, status labels, Clerk/Stripe dashboard URLs |
| User (infra) | `src/infrastructure/database/user-queries.ts` | Fetches all users with subscription + plan data |
| Invoice (domain) | `src/domain/invoice/invoice.ts` | Maps raw invoice data → InvoiceRow using Money module |
| Invoice (infra) | `src/infrastructure/stripe/invoices.ts` | Fetches invoices from Stripe API |
| Stripe prices | `src/infrastructure/stripe/prices.ts` | Fetches active recurring prices, validates individual price IDs |
| Stripe client | `src/infrastructure/stripe/client.ts` | Stripe singleton |
| Prisma client | `src/infrastructure/database/client.ts` | Prisma singleton |
| Clerk webhook | `src/app/api/webhooks/clerk/route.ts` | Creates/updates/deletes User in DB |
| Stripe webhook | `src/app/api/webhooks/stripe/route.ts` | Handles subscription lifecycle events |

---

## Entry Points

| Entry point | Path | Description |
|---|---|---|
| Marketing site | `src/app/(marketing)/page.tsx` | Landing + pricing page |
| Dashboard | `src/app/(dashboard)/dashboard/page.tsx` | Authenticated dashboard home |
| Settings (tabbed) | `src/app/(dashboard)/settings/layout.tsx` | Tab shell — Profile + Billing |
| Profile settings | `src/app/(dashboard)/settings/page.tsx` | Clerk `<UserProfile />` inline |
| Billing settings | `src/app/(dashboard)/settings/billing/page.tsx` | Manage/upgrade subscription |
| Invoice history | `src/app/(dashboard)/settings/billing/invoices/page.tsx` | Read-only invoice table (Server Component) |
| Admin plans | `src/app/(dashboard)/admin/plans/page.tsx` | Plan CRUD with Stripe price picker |
| Admin users | `src/app/(dashboard)/admin/users/page.tsx` | Read-only user table with subscription status |
| Admin API: prices | `src/app/api/admin/stripe-prices/route.ts` | GET active recurring Stripe prices |
| Admin API: plans | `src/app/api/admin/plans/route.ts` | POST create plan |
| Admin API: plan | `src/app/api/admin/plans/[id]/route.ts` | PUT update, DELETE delete plan |
| Clerk webhook | `src/app/api/webhooks/clerk/route.ts` | User sync from Clerk |
| Stripe webhook | `src/app/api/webhooks/stripe/route.ts` | Subscription sync from Stripe |

---

## Frozen / Sensitive Areas

| Area | Reason |
|---|---|
| `src/infrastructure/stripe/client.ts` | Single Stripe instantiation point — do not add a second |
| `src/infrastructure/database/client.ts` | Single Prisma instantiation point — always import from here |
| `src/app/api/webhooks/` | Webhook signature verification must not be removed |

---

## External Dependencies

| Package | Purpose |
|---|---|
| `next` | App framework (App Router) |
| `@clerk/nextjs` | Auth — user management, session, social providers |
| `stripe` | Stripe API client (server-only) |
| `@stripe/stripe-js` | Stripe.js (client-side, for future Stripe Elements use) |
| `svix` | Clerk webhook signature verification |
| `@prisma/client` + `prisma` | ORM + migrations |
| `tailwindcss` v4 | Styling |
| `@tailwindcss/postcss` | Tailwind v4 PostCSS plugin |
| `class-variance-authority` | Component variant styling (shadcn pattern) |
| `clsx` + `tailwind-merge` | Class name utilities |
| `lucide-react` | Icons |
| `@radix-ui/*` | Accessible UI primitives |
