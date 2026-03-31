import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../../src/infrastructure/database/client'
import {
  syncSubscription,
  deleteSubscription,
} from '../../../src/services/billing/subscriptionSyncService'
import type Stripe from 'stripe'

// ─────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────

const TEST_USER_ID = 'user_test_integration_01'
const MONTHLY_PRICE_ID = 'price_pro_monthly_test'
const ANNUAL_PRICE_ID = 'price_pro_annual_test'
const STRIPE_SUB_ID = 'sub_test_integration_01'

function makeStripeSubscription(
  overrides: Partial<{
    id: string
    userId: string
    priceId: string
    status: Stripe.Subscription['status']
    cancelAtPeriodEnd: boolean
    currentPeriodStart: number
    currentPeriodEnd: number
  }> = {}
): Stripe.Subscription {
  const now = Math.floor(Date.now() / 1000)
  const {
    id = STRIPE_SUB_ID,
    userId = TEST_USER_ID,
    priceId = MONTHLY_PRICE_ID,
    status = 'active',
    cancelAtPeriodEnd = false,
    currentPeriodStart = now,
    currentPeriodEnd = now + 30 * 24 * 60 * 60,
  } = overrides

  // Cast via unknown — we only populate the fields our service actually reads.
  // In Stripe API 2026-03-25.dahlia, period fields live on SubscriptionItem, not Subscription.
  return {
    id,
    object: 'subscription',
    status,
    cancel_at_period_end: cancelAtPeriodEnd,
    metadata: { userId },
    items: {
      object: 'list',
      data: [
        {
          id: 'si_test',
          object: 'subscription_item',
          price: { id: priceId } as Stripe.Price,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
        } as unknown as Stripe.SubscriptionItem,
      ],
      has_more: false,
      url: '',
    },
  } as unknown as Stripe.Subscription
}

// ─────────────────────────────────────────────
// Seed helpers
// ─────────────────────────────────────────────

async function seedPlan() {
  return prisma.plan.create({
    data: {
      name: 'Pro',
      description: 'Pro plan',
      stripePriceIdMonthly: MONTHLY_PRICE_ID,
      stripePriceIdAnnual: ANNUAL_PRICE_ID,
      amountMonthly: 1900,
      amountAnnual: 19000,
      currency: 'USD',
      features: ['Feature A', 'Feature B'],
    },
  })
}

async function seedUser() {
  return prisma.user.create({
    data: { id: TEST_USER_ID, email: 'test@example.com' },
  })
}

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe('syncSubscription', () => {
  beforeEach(async () => {
    await seedPlan()
    await seedUser()
  })

  it('creates a new subscription record when one does not exist', async () => {
    const stripeSub = makeStripeSubscription()

    await syncSubscription(stripeSub)

    const sub = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: STRIPE_SUB_ID },
    })

    expect(sub).not.toBeNull()
    expect(sub!.userId).toBe(TEST_USER_ID)
    expect(sub!.status).toBe('active')
    expect(sub!.stripePriceId).toBe(MONTHLY_PRICE_ID)
    expect(sub!.cancelAtPeriodEnd).toBe(false)
  })

  it('updates an existing subscription record on repeat sync', async () => {
    const initial = makeStripeSubscription({ status: 'active' })
    await syncSubscription(initial)

    const updated = makeStripeSubscription({
      status: 'past_due',
      cancelAtPeriodEnd: true,
    })
    await syncSubscription(updated)

    const sub = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: STRIPE_SUB_ID },
    })

    expect(sub!.status).toBe('past_due')
    expect(sub!.cancelAtPeriodEnd).toBe(true)
  })

  it('correctly stores the annual price ID when billing annually', async () => {
    const stripeSub = makeStripeSubscription({ priceId: ANNUAL_PRICE_ID })

    await syncSubscription(stripeSub)

    const sub = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: STRIPE_SUB_ID },
    })

    expect(sub!.stripePriceId).toBe(ANNUAL_PRICE_ID)
  })

  it('stores currentPeriodStart and currentPeriodEnd as Date objects', async () => {
    const now = Math.floor(Date.now() / 1000)
    const end = now + 30 * 24 * 60 * 60
    const stripeSub = makeStripeSubscription({
      currentPeriodStart: now,
      currentPeriodEnd: end,
    })

    await syncSubscription(stripeSub)

    const sub = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: STRIPE_SUB_ID },
    })

    expect(sub!.currentPeriodStart).toBeInstanceOf(Date)
    expect(sub!.currentPeriodEnd).toBeInstanceOf(Date)
    expect(sub!.currentPeriodEnd.getTime()).toBeCloseTo(end * 1000, -3)
  })

  it('handles all valid Stripe subscription statuses', async () => {
    const statuses: Stripe.Subscription['status'][] = [
      'active',
      'canceled',
      'incomplete',
      'incomplete_expired',
      'past_due',
      'trialing',
      'unpaid',
    ]

    // Each status needs its own user — userId is unique on Subscription
    for (const status of statuses) {
      const userId = `user_status_test_${status}`
      await prisma.user.create({ data: { id: userId, email: `${status}@example.com` } })

      const stripeSub = makeStripeSubscription({
        id: `sub_test_${status}`,
        userId,
        status,
      })
      await syncSubscription(stripeSub)

      const sub = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: `sub_test_${status}` },
      })
      expect(sub!.status).toBe(status)
    }
  })

  it('throws when no plan matches the Stripe price ID', async () => {
    const stripeSub = makeStripeSubscription({ priceId: 'price_unknown_xyz' })

    await expect(syncSubscription(stripeSub)).rejects.toThrow(
      'No plan found for Stripe price ID: price_unknown_xyz'
    )
  })

  it('throws when the Stripe subscription has no userId in metadata', async () => {
    const stripeSub = makeStripeSubscription()
    // Force empty metadata via unknown cast to test the missing-userId guard
    ;(stripeSub as unknown as { metadata: Record<string, string> }).metadata = {}

    await expect(syncSubscription(stripeSub)).rejects.toThrow('has no userId in metadata')
  })
})

describe('deleteSubscription', () => {
  beforeEach(async () => {
    await seedPlan()
    await seedUser()
  })

  it('removes a subscription record from the database', async () => {
    await syncSubscription(makeStripeSubscription())

    await deleteSubscription(STRIPE_SUB_ID)

    const sub = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: STRIPE_SUB_ID },
    })
    expect(sub).toBeNull()
  })

  it('does not throw when deleting a subscription that does not exist', async () => {
    await expect(deleteSubscription('sub_nonexistent')).resolves.not.toThrow()
  })
})
