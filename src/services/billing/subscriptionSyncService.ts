// Service: Subscription Sync
//
// Syncs a Stripe subscription into the database.
// Called by the Stripe webhook handler on subscription lifecycle events.

import type Stripe from 'stripe'
import { prisma } from '../../infrastructure/database/client'
import { type SubscriptionStatus } from '../../domain/subscription/subscription'

function toDbStatus(status: Stripe.Subscription['status']): SubscriptionStatus {
  const valid: SubscriptionStatus[] = [
    'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid',
  ]
  if ((valid as string[]).includes(status)) return status as SubscriptionStatus
  throw new Error(`Unknown Stripe subscription status: ${status}`)
}

export async function syncSubscription(stripeSub: Stripe.Subscription): Promise<void> {
  const userId = stripeSub.metadata?.userId
  if (!userId) {
    throw new Error(`Stripe subscription ${stripeSub.id} has no userId in metadata`)
  }

  const item = stripeSub.items.data[0]
  if (!item) {
    throw new Error(`Stripe subscription ${stripeSub.id} has no line items`)
  }

  const stripePriceId = item.price.id

  const plan = await prisma.plan.findFirst({
    where: {
      OR: [
        { stripePriceIdMonthly: stripePriceId },
        { stripePriceIdAnnual: stripePriceId },
      ],
    },
  })

  if (!plan) {
    throw new Error(`No plan found for Stripe price ID: ${stripePriceId}`)
  }

  const status = toDbStatus(stripeSub.status)

  // In Stripe API 2026-03-25.dahlia, period fields moved from Subscription to SubscriptionItem
  const periodStart = new Date(item.current_period_start * 1000)
  const periodEnd = new Date(item.current_period_end * 1000)

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: stripeSub.id },
    create: {
      userId,
      planId: plan.id,
      stripeSubscriptionId: stripeSub.id,
      stripePriceId,
      status,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    },
    update: {
      planId: plan.id,
      stripePriceId,
      status,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    },
  })
}

export async function deleteSubscription(stripeSubscriptionId: string): Promise<void> {
  await prisma.subscription.deleteMany({
    where: { stripeSubscriptionId },
  })
}
