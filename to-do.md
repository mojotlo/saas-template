# Feature To-Do

Informal backlog. Each item gets a proper `/spec` and GitHub issue before implementation.

**Status markers:** `[ ]` not started · `[🔄]` in progress (issue created) · `[x]` done (PR merged)
**Dependency format:** `*(needs: #N Title)*` or `*(needs: none)*`

---

## Admin Views

- [ ] **Admin: User management** — searchable/filterable user table showing email, plan, subscription status, Clerk metadata. Link out to Clerk dashboard per user. *(needs: none)*
- [ ] **Admin: Stripe subscription overview** — surface subscription status, MRR, and link to Stripe dashboard per customer. Not a full Stripe replica, just enough to avoid context-switching. *(needs: none)*
- [ ] **Admin: Plan management** — CRUD UI for plans (name, description, price, features, Stripe price IDs). Replaces manual DB seeding. *(needs: none)*

## Account & Billing

- [x] **Account settings page** — profile editing (name, email via Clerk), account deletion, connected accounts. Wire up the existing `/dashboard/settings` nav link. *(needs: none)*
- [x] **Invoice history page** — pull invoices from Stripe API, display date/amount/status/PDF download link. *(needs: none)*
- [x] **Invoices settings tab** — add "Invoices" tab to the settings tab bar. *(needs: none)*

## Infrastructure

- [x] **Toast notifications** — global toast/notification system (success, error, info). Wire into existing flows (checkout, billing portal, errors).
- [x] **Stripe webhook idempotency** — track processed event IDs to prevent duplicate handling on retries.

