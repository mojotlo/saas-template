// Domain: User
//
// Pure types and functions for admin user management display.
// No side effects, no external dependencies.

export type UserRow = {
  id: string
  email: string
  planName: string | null
  statusLabel: string
  stripeCustomerId: string | null
  joinedDate: string
}

export type RawUserWithSubscription = {
  id: string
  email: string
  stripeCustomerId: string | null
  createdAt: Date
  subscription: {
    status: string
    cancelAtPeriodEnd: boolean
    plan: { name: string } | null
  } | null
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  trialing: 'Trialing',
  canceled: 'Canceled',
  past_due: 'Past Due',
  incomplete: 'Incomplete',
  incomplete_expired: 'Incomplete Expired',
  unpaid: 'Unpaid',
}

export function getUserStatusLabel(
  status: string | null,
  cancelAtPeriodEnd: boolean
): string {
  if (status === null) return 'No Subscription'
  if (status === 'active' && cancelAtPeriodEnd) return 'Canceling'
  return STATUS_LABELS[status] ?? status
}

export function mapUserRow(raw: RawUserWithSubscription): UserRow {
  return {
    id: raw.id,
    email: raw.email,
    planName: raw.subscription?.plan?.name ?? null,
    statusLabel: getUserStatusLabel(
      raw.subscription?.status ?? null,
      raw.subscription?.cancelAtPeriodEnd ?? false
    ),
    stripeCustomerId: raw.stripeCustomerId,
    joinedDate: raw.createdAt.toLocaleDateString(),
  }
}

export function getClerkDashboardUrl(userId: string): string {
  return `https://dashboard.clerk.com/last-active?path=users/${userId}`
}

export function getStripeDashboardCustomerUrl(
  stripeCustomerId: string
): string {
  return `https://dashboard.stripe.com/customers/${stripeCustomerId}`
}
