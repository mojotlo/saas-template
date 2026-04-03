# Planning: Admin Views

**Date:** 2026-04-02
**Status:** In progress

## Original scope

Three admin views from the backlog:

1. Admin: Plan management — CRUD UI for plans (name, description, price, features, Stripe price IDs). Replaces manual DB seeding.
2. Admin: User management — searchable/filterable user table showing email, plan, subscription status, Clerk metadata. Link out to Clerk dashboard per user.
3. Admin: Stripe subscription overview — surface subscription status, MRR, and link to Stripe dashboard per customer.

## Split decision

Plan management was specced first because it establishes the admin foundation (route group, auth guard, layout, sidebar nav) that the other two views depend on.

Plan management itself was split into two issues due to 21 acceptance criteria spanning 4 layers:

### Issue sequence

1. **Admin foundation + Plan list (read-only)** — admin route group, role-based auth via `publicMetadata.role`, admin layout/sidebar, plan list table, admin link in main sidebar
2. **Plan CRUD** — Stripe price fetching dropdown, auto-fill from Stripe, create/update/delete plans with validation
3. **Admin: User management** — builds on admin layout from #1, read-only table (can parallelize with #4 after #1 merges)
4. **Admin: Stripe subscription overview** — builds on admin layout from #1, read-only table (can parallelize with #3 after #1 merges)

### Cross-issue dependencies

- Issues 2, 3, 4 all depend on issue 1 (admin foundation)
- Issues 3 and 4 are independent of each other and can be built in parallel worktrees after #1 merges
- Issue 2 depends on #1 only

## Key decisions made during spec

- **Auth approach:** `publicMetadata.role === 'admin'` via Clerk (not Organizations)
- **Delete behavior:** Hard delete, blocked if plan has subscriptions
- **Features field:** Textarea, one feature per line, saved as String[]
- **Stripe price IDs:** Dropdown picker populated from `stripe.prices.list()`, auto-fills amount/currency
- **No Stripe price creation from UI** — prices must exist in Stripe first
- **Stripe fetch error:** Single error state with links to both Stripe Prices page and API Keys page
- **Refund display removed from backlog** — credit notes are too niche for a template
