import { describe, it, expect } from 'vitest'
import {
  getUserStatusLabel,
  mapUserRow,
  getClerkDashboardUrl,
  getStripeDashboardCustomerUrl,
  type RawUserWithSubscription,
} from './user'

describe('getUserStatusLabel', () => {
  it('returns "No Subscription" when status is null', () => {
    expect(getUserStatusLabel(null, false)).toBe('No Subscription')
  })

  it('returns "Active" for active subscription', () => {
    expect(getUserStatusLabel('active', false)).toBe('Active')
  })

  it('returns "Canceling" for active subscription with cancelAtPeriodEnd', () => {
    expect(getUserStatusLabel('active', true)).toBe('Canceling')
  })

  it('returns "Trialing" for trialing subscription', () => {
    expect(getUserStatusLabel('trialing', false)).toBe('Trialing')
  })

  it('returns "Canceled" for canceled subscription', () => {
    expect(getUserStatusLabel('canceled', false)).toBe('Canceled')
  })

  it('returns "Past Due" for past_due subscription', () => {
    expect(getUserStatusLabel('past_due', false)).toBe('Past Due')
  })

  it('returns "Incomplete" for incomplete subscription', () => {
    expect(getUserStatusLabel('incomplete', false)).toBe('Incomplete')
  })

  it('returns "Unpaid" for unpaid subscription', () => {
    expect(getUserStatusLabel('unpaid', false)).toBe('Unpaid')
  })

  it('returns "Incomplete Expired" for incomplete_expired subscription', () => {
    expect(getUserStatusLabel('incomplete_expired', false)).toBe('Incomplete Expired')
  })

  it('returns the raw status string for unknown statuses', () => {
    expect(getUserStatusLabel('paused', false)).toBe('paused')
  })
})

describe('mapUserRow', () => {
  it('maps user with active subscription and plan', () => {
    const raw: RawUserWithSubscription = {
      id: 'user_123',
      email: 'test@example.com',
      stripeCustomerId: 'cus_abc',
      createdAt: new Date('2026-01-15'),
      subscription: {
        status: 'active',
        cancelAtPeriodEnd: false,
        plan: { name: 'Pro' },
      },
    }

    const row = mapUserRow(raw)
    expect(row).toEqual({
      id: 'user_123',
      email: 'test@example.com',
      planName: 'Pro',
      statusLabel: 'Active',
      stripeCustomerId: 'cus_abc',
      joinedDate: new Date('2026-01-15').toLocaleDateString(),
    })
  })

  it('maps user with no subscription', () => {
    const raw: RawUserWithSubscription = {
      id: 'user_456',
      email: 'free@example.com',
      stripeCustomerId: null,
      createdAt: new Date('2026-02-01'),
      subscription: null,
    }

    const row = mapUserRow(raw)
    expect(row).toEqual({
      id: 'user_456',
      email: 'free@example.com',
      planName: null,
      statusLabel: 'No Subscription',
      stripeCustomerId: null,
      joinedDate: new Date('2026-02-01').toLocaleDateString(),
    })
  })

  it('maps user with canceling subscription', () => {
    const raw: RawUserWithSubscription = {
      id: 'user_789',
      email: 'canceling@example.com',
      stripeCustomerId: 'cus_xyz',
      createdAt: new Date('2026-03-01'),
      subscription: {
        status: 'active',
        cancelAtPeriodEnd: true,
        plan: { name: 'Enterprise' },
      },
    }

    const row = mapUserRow(raw)
    expect(row).toEqual({
      id: 'user_789',
      email: 'canceling@example.com',
      planName: 'Enterprise',
      statusLabel: 'Canceling',
      stripeCustomerId: 'cus_xyz',
      joinedDate: new Date('2026-03-01').toLocaleDateString(),
    })
  })

  it('maps user with null plan name when subscription has no plan', () => {
    const raw: RawUserWithSubscription = {
      id: 'user_000',
      email: 'noplan@example.com',
      stripeCustomerId: null,
      createdAt: new Date('2026-01-01'),
      subscription: {
        status: 'canceled',
        cancelAtPeriodEnd: false,
        plan: null,
      },
    }

    const row = mapUserRow(raw)
    expect(row).toEqual({
      id: 'user_000',
      email: 'noplan@example.com',
      planName: null,
      statusLabel: 'Canceled',
      stripeCustomerId: null,
      joinedDate: new Date('2026-01-01').toLocaleDateString(),
    })
  })
})

describe('getClerkDashboardUrl', () => {
  it('returns the correct Clerk dashboard URL', () => {
    expect(getClerkDashboardUrl('user_abc123')).toBe(
      'https://dashboard.clerk.com/last-active?path=users/user_abc123'
    )
  })
})

describe('getStripeDashboardCustomerUrl', () => {
  it('returns the correct Stripe dashboard URL', () => {
    expect(getStripeDashboardCustomerUrl('cus_abc123')).toBe(
      'https://dashboard.stripe.com/customers/cus_abc123'
    )
  })
})
