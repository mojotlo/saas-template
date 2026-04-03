import { describe, it, expect } from 'vitest'
import {
  calculateMrr,
  getSubscriptionStatusCounts,
  getStripeDashboardSubscriptionUrl,
  getStatusBadgeVariant,
  mapSubscriptionRow,
  toMrrLineItem,
  type MrrLineItem,
  type RawSubscriptionData,
} from './admin'
import { createMoney } from '../money/money'
import { SubscriptionError } from './subscription'

// --- Helper factories ---

function makeMrrItem(overrides: Partial<MrrLineItem> = {}): MrrLineItem {
  return {
    status: 'active',
    amountMonthly: 1900,
    amountAnnual: 19000,
    interval: 'monthly',
    currency: 'USD',
    ...overrides,
  }
}

function makeRawSubscription(
  overrides: Partial<RawSubscriptionData> = {}
): RawSubscriptionData {
  return {
    stripeSubscriptionId: 'sub_abc123',
    stripePriceId: 'price_monthly_123',
    status: 'active',
    currentPeriodEnd: new Date('2026-12-31'),
    cancelAtPeriodEnd: false,
    user: { email: 'user@example.com' },
    plan: {
      name: 'Pro',
      stripePriceIdMonthly: 'price_monthly_123',
      stripePriceIdAnnual: 'price_annual_456',
      amountMonthly: 1900,
      amountAnnual: 19000,
      currency: 'USD',
    },
    ...overrides,
  }
}

// --- calculateMrr ---

describe('calculateMrr', () => {
  it('returns zero for empty array', () => {
    expect(calculateMrr([])).toEqual(createMoney(0, 'USD'))
  })

  it('sums monthly subscriptions directly', () => {
    const items = [
      makeMrrItem({ interval: 'monthly', amountMonthly: 1900 }),
      makeMrrItem({ interval: 'monthly', amountMonthly: 2900 }),
    ]
    expect(calculateMrr(items)).toEqual(createMoney(4800, 'USD'))
  })

  it('converts annual subscriptions with round(amountAnnual / 12)', () => {
    const items = [makeMrrItem({ interval: 'annual', amountAnnual: 19000 })]
    // Math.round(19000 / 12) = 1583
    expect(calculateMrr(items)).toEqual(createMoney(1583, 'USD'))
  })

  it('mixes monthly and annual subscriptions', () => {
    const items = [
      makeMrrItem({ interval: 'monthly', amountMonthly: 1900 }),
      makeMrrItem({ interval: 'annual', amountAnnual: 19000 }),
    ]
    // 1900 + 1583 = 3483
    expect(calculateMrr(items)).toEqual(createMoney(3483, 'USD'))
  })

  it('includes active subscriptions', () => {
    const items = [makeMrrItem({ status: 'active', amountMonthly: 1900 })]
    expect(calculateMrr(items).amount).toBe(1900)
  })

  it('includes trialing subscriptions', () => {
    const items = [makeMrrItem({ status: 'trialing', amountMonthly: 1900 })]
    expect(calculateMrr(items).amount).toBe(1900)
  })

  it('includes canceling-but-active subscriptions (status still active)', () => {
    const items = [
      makeMrrItem({
        status: 'active',
        amountMonthly: 1900,
      }),
    ]
    expect(calculateMrr(items).amount).toBe(1900)
  })

  it('excludes past_due subscriptions', () => {
    const items = [makeMrrItem({ status: 'past_due', amountMonthly: 1900 })]
    expect(calculateMrr(items).amount).toBe(0)
  })

  it('excludes canceled subscriptions', () => {
    const items = [makeMrrItem({ status: 'canceled', amountMonthly: 1900 })]
    expect(calculateMrr(items).amount).toBe(0)
  })

  it('excludes unpaid, incomplete, and incomplete_expired', () => {
    const items = [
      makeMrrItem({ status: 'unpaid' }),
      makeMrrItem({ status: 'incomplete' }),
      makeMrrItem({ status: 'incomplete_expired' }),
    ]
    expect(calculateMrr(items).amount).toBe(0)
  })
})

// --- getSubscriptionStatusCounts ---

describe('getSubscriptionStatusCounts', () => {
  it('returns all zeros for empty array', () => {
    expect(getSubscriptionStatusCounts([])).toEqual({
      active: 0,
      trialing: 0,
      pastDue: 0,
    })
  })

  it('counts active subscriptions', () => {
    const counts = getSubscriptionStatusCounts(['active', 'active', 'canceled'])
    expect(counts.active).toBe(2)
  })

  it('counts trialing subscriptions', () => {
    const counts = getSubscriptionStatusCounts(['trialing', 'active'])
    expect(counts.trialing).toBe(1)
  })

  it('counts past_due subscriptions', () => {
    const counts = getSubscriptionStatusCounts(['past_due', 'past_due'])
    expect(counts.pastDue).toBe(2)
  })

  it('counts mixed statuses correctly', () => {
    const counts = getSubscriptionStatusCounts([
      'active',
      'trialing',
      'past_due',
      'canceled',
      'active',
    ])
    expect(counts).toEqual({ active: 2, trialing: 1, pastDue: 1 })
  })
})

// --- getStripeDashboardSubscriptionUrl ---

describe('getStripeDashboardSubscriptionUrl', () => {
  it('returns correct Stripe dashboard URL', () => {
    expect(getStripeDashboardSubscriptionUrl('sub_abc123')).toBe(
      'https://dashboard.stripe.com/subscriptions/sub_abc123'
    )
  })
})

// --- getStatusBadgeVariant ---

describe('getStatusBadgeVariant', () => {
  it('returns default for active', () => {
    expect(getStatusBadgeVariant('active')).toBe('default')
  })

  it('returns secondary for trialing', () => {
    expect(getStatusBadgeVariant('trialing')).toBe('secondary')
  })

  it('returns destructive for past_due', () => {
    expect(getStatusBadgeVariant('past_due')).toBe('destructive')
  })

  it('returns outline for canceled', () => {
    expect(getStatusBadgeVariant('canceled')).toBe('outline')
  })

  it('returns outline for other statuses', () => {
    expect(getStatusBadgeVariant('unpaid')).toBe('outline')
    expect(getStatusBadgeVariant('incomplete')).toBe('outline')
    expect(getStatusBadgeVariant('incomplete_expired')).toBe('outline')
  })
})

// --- toMrrLineItem ---

describe('toMrrLineItem', () => {
  it('maps raw data to MrrLineItem with monthly interval', () => {
    const raw = makeRawSubscription({ stripePriceId: 'price_monthly_123' })
    expect(toMrrLineItem(raw)).toEqual({
      status: 'active',
      amountMonthly: 1900,
      amountAnnual: 19000,
      interval: 'monthly',
      currency: 'USD',
    })
  })

  it('maps raw data to MrrLineItem with annual interval', () => {
    const raw = makeRawSubscription({ stripePriceId: 'price_annual_456' })
    expect(toMrrLineItem(raw).interval).toBe('annual')
  })

  it('throws SubscriptionError for unknown price ID', () => {
    const raw = makeRawSubscription({ stripePriceId: 'price_unknown' })
    expect(() => toMrrLineItem(raw)).toThrow(SubscriptionError)
  })

  it('throws for unsupported currency', () => {
    const raw = makeRawSubscription()
    raw.plan.currency = 'JPY'
    expect(() => toMrrLineItem(raw)).toThrow('Unsupported currency')
  })
})

// --- mapSubscriptionRow ---

describe('mapSubscriptionRow', () => {
  it('maps raw data to AdminSubscriptionRow', () => {
    const raw = makeRawSubscription()
    const row = mapSubscriptionRow(raw)
    expect(row).toEqual({
      email: 'user@example.com',
      planName: 'Pro',
      status: 'active',
      interval: 'monthly',
      periodEnd: '2026-12-31T00:00:00.000Z',
      stripeSubscriptionId: 'sub_abc123',
    })
  })

  it('infers monthly interval from matching price ID', () => {
    const raw = makeRawSubscription({
      stripePriceId: 'price_monthly_123',
    })
    expect(mapSubscriptionRow(raw).interval).toBe('monthly')
  })

  it('infers annual interval from matching price ID', () => {
    const raw = makeRawSubscription({
      stripePriceId: 'price_annual_456',
    })
    expect(mapSubscriptionRow(raw).interval).toBe('annual')
  })

  it('throws SubscriptionError for unknown price ID', () => {
    const raw = makeRawSubscription({ stripePriceId: 'price_unknown' })
    expect(() => mapSubscriptionRow(raw)).toThrow(SubscriptionError)
  })
})
