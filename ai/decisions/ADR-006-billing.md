# ADR-006: Billing — Stripe Subscriptions + Svix Webhook Verification

**Status:** Accepted
**Date:** 2026-03-30
**Revisit when:** Stripe fees exceed acceptable threshold, need usage-based billing, or stronger vendor independence required

---

## Decision

Use Stripe for subscription billing with monthly/annual plans. Use Svix for verifying Clerk webhook signatures (Clerk uses Svix internally). Stripe webhooks are verified using Stripe's own SDK (`stripe.webhooks.constructEvent`).

API version pinned to `2026-03-25.dahlia`.

---

## Why Stripe

- **Industry standard** — most widely deployed payments infrastructure; extensive documentation, SDKs, and community support
- **Subscription management** — built-in support for monthly/annual plans, trials, proration, dunning, and the customer portal (self-serve plan changes, cancellation, invoice history)
- **Developer experience** — TypeScript SDK with strong types; webhook simulator for local development (`stripe listen`)
- **Test mode** — fully functional test environment with no charges; test card numbers for all edge cases

---

## Billing architecture

- `Plan` rows in Postgres store Stripe price IDs (monthly + annual) and display metadata
- `Subscription` rows are synced from Stripe via webhooks — the DB is a read-replica of Stripe, not the source of truth
- `stripeCustomerId` is stored on `User` after first successful checkout (`checkout.session.completed`)
- Access control is evaluated via pure domain functions in `src/domain/subscription/subscription.ts` — no Stripe API calls at access-check time

### Webhook events handled

| Event | Action |
|---|---|
| `checkout.session.completed` | Saves `stripeCustomerId` on User |
| `customer.subscription.created` | Creates Subscription record |
| `customer.subscription.updated` | Updates Subscription record |
| `customer.subscription.deleted` | Deletes Subscription record |

---

## Alternatives considered

| Option | Reason not chosen |
|---|---|
| **Paddle** | Merchant of record (simpler global tax), but less flexible API and smaller ecosystem |
| **LemonSqueezy** | Similar to Paddle, good for simple products; limited subscription management features vs Stripe |
| **RevenueCat** | Mobile-first; not well suited to web SaaS |
| **Custom billing** | Significant complexity for dunning, tax, disputes, PCI compliance — not justified for a template |

---

## API version

Pinned to `2026-03-25.dahlia` in `src/infrastructure/stripe/client.ts`.

**Upgrade triggers:**
- Stripe deprecates the pinned version
- A needed feature only exists in a newer version
- Run `stripe api-versions list` to see available versions

When upgrading: update the `apiVersion` string in `client.ts`, re-run typecheck to surface any breaking type changes, and test all webhook handlers against the new API version using Stripe's webhook fixtures.

---

## Svix

Svix is used solely for verifying Clerk webhook signatures (`POST /api/webhooks/clerk`). Clerk uses Svix as its webhook delivery infrastructure and signs payloads with a Svix-compatible signature. No Svix API features beyond signature verification are used.

---

## Local development

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Use Stripe test cards: `4242 4242 4242 4242` (success), `4000 0000 0000 9995` (decline).

---

## Upgrade / migration path

- **Paddle or LemonSqueezy** — migrate if Stripe processing fees become a significant burden and merchant-of-record tax handling is desirable. Requires replacing `src/infrastructure/stripe/`, `src/services/billing/`, and both webhook routes.
- **Usage-based billing** — Stripe supports metered billing natively; add a usage reporting service in `src/services/billing/` and update the Plan/Subscription schema.
