// Domain: Subscription Admin
//
// Pure functions for admin subscription overview.
// No side effects, no external dependencies beyond sibling domain modules.

import { createMoney, isSupportedCurrency, type Money, type Currency } from '../money/money'
import { inferBillingInterval } from './subscription'
import type { SubscriptionStatus, BillingInterval } from './subscription'

export type MrrLineItem = {
  status: SubscriptionStatus
  amountMonthly: number
  amountAnnual: number
  interval: BillingInterval
  currency: Currency
}

export type SubscriptionStatusCounts = {
  active: number
  trialing: number
  pastDue: number
}

export type RawSubscriptionData = {
  stripeSubscriptionId: string
  stripePriceId: string
  status: SubscriptionStatus
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  user: { email: string }
  plan: {
    name: string
    stripePriceIdMonthly: string
    stripePriceIdAnnual: string
    amountMonthly: number
    amountAnnual: number
    currency: string
  }
}

export type AdminSubscriptionRow = {
  email: string
  planName: string
  status: SubscriptionStatus
  interval: BillingInterval
  periodEnd: string
  stripeSubscriptionId: string
}

const MRR_ELIGIBLE_STATUSES: ReadonlySet<SubscriptionStatus> = new Set([
  'active',
  'trialing',
])

export function calculateMrr(items: MrrLineItem[]): Money {
  let totalCents = 0

  for (const item of items) {
    if (!MRR_ELIGIBLE_STATUSES.has(item.status)) continue

    if (item.interval === 'monthly') {
      totalCents += item.amountMonthly
    } else {
      totalCents += Math.round(item.amountAnnual / 12)
    }
  }

  const currency = items.length > 0 ? items[0].currency : 'USD'
  return createMoney(totalCents, currency)
}

export function getSubscriptionStatusCounts(
  statuses: SubscriptionStatus[]
): SubscriptionStatusCounts {
  let active = 0
  let trialing = 0
  let pastDue = 0

  for (const status of statuses) {
    if (status === 'active') active++
    else if (status === 'trialing') trialing++
    else if (status === 'past_due') pastDue++
  }

  return { active, trialing, pastDue }
}

export function getStripeDashboardSubscriptionUrl(
  stripeSubscriptionId: string
): string {
  return `https://dashboard.stripe.com/subscriptions/${stripeSubscriptionId}`
}

export function getStatusBadgeVariant(
  status: SubscriptionStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default'
    case 'trialing':
      return 'secondary'
    case 'past_due':
      return 'destructive'
    default:
      return 'outline'
  }
}

function resolveInterval(raw: RawSubscriptionData): BillingInterval {
  return inferBillingInterval(
    raw.stripePriceId,
    raw.plan.stripePriceIdMonthly,
    raw.plan.stripePriceIdAnnual
  )
}

function resolveCurrency(raw: RawSubscriptionData): Currency {
  if (!isSupportedCurrency(raw.plan.currency)) {
    throw new Error(
      `Unsupported currency "${raw.plan.currency}" on plan "${raw.plan.name}"`
    )
  }
  return raw.plan.currency.toUpperCase() as Currency
}

export function toMrrLineItem(raw: RawSubscriptionData): MrrLineItem {
  return {
    status: raw.status,
    amountMonthly: raw.plan.amountMonthly,
    amountAnnual: raw.plan.amountAnnual,
    interval: resolveInterval(raw),
    currency: resolveCurrency(raw),
  }
}

export function mapSubscriptionRow(raw: RawSubscriptionData): AdminSubscriptionRow {
  return {
    email: raw.user.email,
    planName: raw.plan.name,
    status: raw.status,
    interval: resolveInterval(raw),
    periodEnd: raw.currentPeriodEnd.toISOString(),
    stripeSubscriptionId: raw.stripeSubscriptionId,
  }
}
