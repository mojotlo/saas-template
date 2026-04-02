import { describe, it, expect } from 'vitest'
import { prisma } from '../../../src/infrastructure/database/client'
import {
  isEventProcessed,
  markEventProcessed,
} from '../../../src/services/webhook/webhookEventService'

describe('isEventProcessed', () => {
  it('returns false when no event with the given eventId and source exists', async () => {
    const result = await isEventProcessed('evt_nonexistent', 'stripe')
    expect(result).toBe(false)
  })

  it('returns true when an event with the given eventId and source has been recorded', async () => {
    await markEventProcessed('evt_recorded', 'stripe', 'customer.subscription.updated')

    const result = await isEventProcessed('evt_recorded', 'stripe')
    expect(result).toBe(true)
  })
})

describe('markEventProcessed', () => {
  it('creates a WebhookEvent row with the correct eventId, source, eventType, and processedAt', async () => {
    await markEventProcessed('evt_new', 'stripe', 'checkout.session.completed')

    const row = await prisma.webhookEvent.findUnique({
      where: { eventId_source: { eventId: 'evt_new', source: 'stripe' } },
    })

    expect(row).not.toBeNull()
    expect(row!.eventId).toBe('evt_new')
    expect(row!.source).toBe('stripe')
    expect(row!.eventType).toBe('checkout.session.completed')
    expect(row!.processedAt).toBeInstanceOf(Date)
  })

  it('does not throw when called twice with the same eventId and source', async () => {
    await markEventProcessed('evt_dup', 'stripe', 'customer.subscription.created')
    await expect(
      markEventProcessed('evt_dup', 'stripe', 'customer.subscription.created')
    ).resolves.not.toThrow()

    // Verify only one row exists
    const count = await prisma.webhookEvent.count({
      where: { eventId: 'evt_dup', source: 'stripe' },
    })
    expect(count).toBe(1)
  })

  it('tracks the same eventId independently for different sources', async () => {
    await markEventProcessed('evt_shared_id', 'stripe', 'customer.subscription.updated')
    await markEventProcessed('evt_shared_id', 'clerk', 'user.created')

    const stripeProcessed = await isEventProcessed('evt_shared_id', 'stripe')
    const clerkProcessed = await isEventProcessed('evt_shared_id', 'clerk')

    expect(stripeProcessed).toBe(true)
    expect(clerkProcessed).toBe(true)

    // Verify two distinct rows
    const count = await prisma.webhookEvent.count({
      where: { eventId: 'evt_shared_id' },
    })
    expect(count).toBe(2)
  })

  it('handles concurrent markEventProcessed calls for the same event without error', async () => {
    // Fire two marks concurrently — one will succeed, the other hits P2002 and returns silently
    await expect(
      Promise.all([
        markEventProcessed('evt_race', 'stripe', 'customer.subscription.updated'),
        markEventProcessed('evt_race', 'stripe', 'customer.subscription.updated'),
      ])
    ).resolves.not.toThrow()

    const count = await prisma.webhookEvent.count({
      where: { eventId: 'evt_race', source: 'stripe' },
    })
    expect(count).toBe(1)
  })
})
