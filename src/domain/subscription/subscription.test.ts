import { describe, it, expect } from 'vitest'
import {
  hasActiveAccess,
  isCancelingAtPeriodEnd,
  isExpired,
  getPriceForInterval,
  annualSavings,
  annualSavingsPercent,
  inferBillingInterval,
  SubscriptionError,
  type Subscription,
  type Plan,
} from './subscription'
import { createMoney } from '../money/money'

const proMonthly = createMoney(1900, 'USD')
const proAnnual = createMoney(19000, 'USD')

const plan: Plan = {
  id: 'plan_pro',
  name: 'Pro',
  description: 'Pro plan',
  priceMonthly: proMonthly,
  priceAnnual: proAnnual,
  features: ['Feature A', 'Feature B'],
}

function makeSub(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: 'sub_1',
    userId: 'user_1',
    planId: 'plan_pro',
    status: 'active',
    billingInterval: 'monthly',
    currentPeriodEnd: new Date('2026-12-31'),
    cancelAtPeriodEnd: false,
    ...overrides,
  }
}

describe('hasActiveAccess', () => {
  it('returns true for active subscription', () => {
    expect(hasActiveAccess(makeSub({ status: 'active' }))).toBe(true)
  })

  it('returns true for trialing subscription', () => {
    expect(hasActiveAccess(makeSub({ status: 'trialing' }))).toBe(true)
  })

  it('returns false for null', () => {
    expect(hasActiveAccess(null)).toBe(false)
  })

  it('returns false for canceled subscription', () => {
    expect(hasActiveAccess(makeSub({ status: 'canceled' }))).toBe(false)
  })

  it('returns false for past_due subscription', () => {
    expect(hasActiveAccess(makeSub({ status: 'past_due' }))).toBe(false)
  })
})

describe('isCancelingAtPeriodEnd', () => {
  it('returns true for active sub with cancelAtPeriodEnd', () => {
    expect(isCancelingAtPeriodEnd(makeSub({ cancelAtPeriodEnd: true }))).toBe(true)
  })

  it('returns false when not canceling', () => {
    expect(isCancelingAtPeriodEnd(makeSub({ cancelAtPeriodEnd: false }))).toBe(false)
  })

  it('returns false for already-canceled sub', () => {
    expect(
      isCancelingAtPeriodEnd(makeSub({ status: 'canceled', cancelAtPeriodEnd: true }))
    ).toBe(false)
  })
})

describe('isExpired', () => {
  it('returns false for active subscription', () => {
    expect(isExpired(makeSub({ status: 'active' }))).toBe(false)
  })

  it('returns true for canceled subscription', () => {
    expect(isExpired(makeSub({ status: 'canceled' }))).toBe(true)
  })

  it('returns true for unpaid subscription', () => {
    expect(isExpired(makeSub({ status: 'unpaid' }))).toBe(true)
  })

  it('returns true for incomplete_expired subscription', () => {
    expect(isExpired(makeSub({ status: 'incomplete_expired' }))).toBe(true)
  })
})

describe('getPriceForInterval', () => {
  it('returns monthly price for monthly interval', () => {
    expect(getPriceForInterval(plan, 'monthly')).toEqual(proMonthly)
  })

  it('returns annual price for annual interval', () => {
    expect(getPriceForInterval(plan, 'annual')).toEqual(proAnnual)
  })
})

describe('annualSavings', () => {
  it('calculates savings vs 12x monthly', () => {
    // 12 * $19.00 = $228.00, annual = $190.00 → savings = $38.00
    const savings = annualSavings(plan)
    expect(savings.amount).toBe(3800)
    expect(savings.currency).toBe('USD')
  })

  it('returns zero when annual costs more than monthly x12', () => {
    const expensivePlan: Plan = {
      ...plan,
      priceMonthly: createMoney(1000, 'USD'),
      priceAnnual: createMoney(15000, 'USD'), // more than 12x monthly
    }
    expect(annualSavings(expensivePlan).amount).toBe(0)
  })
})

describe('annualSavingsPercent', () => {
  it('calculates percentage savings vs 12x monthly', () => {
    // 12 * $19 = $228, annual = $190 → saves $38 → ~16.7% → rounds to 17%
    expect(annualSavingsPercent(19, 190)).toBe(17)
  })

  it('returns 0 when monthly price is 0 (free plan)', () => {
    expect(annualSavingsPercent(0, 0)).toBe(0)
  })

  it('returns 0 when annual costs more than monthly x12', () => {
    expect(annualSavingsPercent(10, 150)).toBe(0)
  })
})

describe('inferBillingInterval', () => {
  it('returns monthly for matching monthly price ID', () => {
    expect(inferBillingInterval('price_monthly_123', 'price_monthly_123', 'price_annual_456')).toBe(
      'monthly'
    )
  })

  it('returns annual for matching annual price ID', () => {
    expect(inferBillingInterval('price_annual_456', 'price_monthly_123', 'price_annual_456')).toBe(
      'annual'
    )
  })

  it('throws SubscriptionError for unknown price ID', () => {
    expect(() =>
      inferBillingInterval('price_unknown', 'price_monthly_123', 'price_annual_456')
    ).toThrow(SubscriptionError)
  })
})
