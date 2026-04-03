# Feature To-Do

Informal backlog. Each item gets a proper `/spec` and GitHub issue before implementation.

**Status markers:** `[ ]` not started · `[🔄]` in progress (issue created) · `[x]` done (PR merged)
**Dependency format:** `*(needs: #N Title)*` or `*(needs: none)*`

---

## Admin Views

- [ ] **Admin: User management** — searchable/filterable user table showing email, plan, subscription status, Clerk metadata. Link out to Clerk dashboard per user. *(needs: Admin foundation + list)*
- [ ] **Admin: Stripe subscription overview** — surface subscription status, MRR, and link to Stripe dashboard per customer. Not a full Stripe replica, just enough to avoid context-switching. *(needs: Admin foundation + list)*
- [x] **Invoice history page** — pull invoices from Stripe API, display date/amount/status/PDF download link. *(needs: none)*
- [] **Admin: Plan management (foundation + list)** — admin route group, role-based auth, layout, plan list table. *(needs: none)*
- [ ] **Admin: Plan management (CRUD)** — create/update/delete plans with Stripe price picker and validation. *(needs: Admin foundation + list)*

## Account & Billing

- [x] **Account settings page** — profile editing (name, email via Clerk), account deletion, connected accounts. Wire up the existing `/dashboard/settings` nav link. *(needs: none)*
- [x] **Invoice history page** — pull invoices from Stripe API, display date/amount/status/PDF download link. *(needs: none)*
- [x] **Invoices settings tab** — add "Invoices" tab to the settings tab bar. *(needs: none)*

## Infrastructure

- [x] **Toast notifications** — global toast/notification system (success, error, info). Wire into existing flows (checkout, billing portal, errors).
- [x] **Stripe webhook idempotency** — track processed event IDs to prevent duplicate handling on retries.

