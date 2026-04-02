# Feature To-Do

Informal backlog. Each item gets a proper `/spec` and GitHub issue before implementation.

---

## Admin Views

- [ ] **Admin: User management** — searchable/filterable user table showing email, plan, subscription status, Clerk metadata. Link out to Clerk dashboard per user.
- [ ] **Admin: Stripe subscription overview** — surface subscription status, MRR, and link to Stripe dashboard per customer. Not a full Stripe replica, just enough to avoid context-switching.
- [ ] **Admin: Plan management** — CRUD UI for plans (name, description, price, features, Stripe price IDs). Replaces manual DB seeding.

## Account & Billing

- [ ] **Account settings page** — profile editing (name, email via Clerk), account deletion, connected accounts. Wire up the existing `/dashboard/settings` nav link.
- [ ] **Invoice history page** — pull invoices from Stripe API, display date/amount/status/PDF download link.
- [ ] **Invoice refund display** — surface credit notes and refunds on the invoice history page.
- [ ] **Invoices sidebar nav link** — add "Invoices" link to the dashboard sidebar nav.

## Infrastructure

- [ ] **Toast notifications** — global toast/notification system (success, error, info). Wire into existing flows (checkout, billing portal, errors).
- [ ] **Stripe webhook idempotency** — track processed event IDs to prevent duplicate handling on retries.

## Onboarding

- [ ] **Onboarding flow skeleton** — `/dashboard/onboarding` with step indicators. Steps are project-specific but the skeleton (routing, progress tracking, completion state) is reusable.
