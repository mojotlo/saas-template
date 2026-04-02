// Service: Webhook Event Idempotency
//
// Tracks processed webhook events to prevent duplicate handling.
// Used by Stripe and Clerk webhook route handlers.

import { prisma } from '../../infrastructure/database/client'

export type WebhookSource = 'stripe' | 'clerk'

/**
 * Returns true if this event has already been processed.
 */
export async function isEventProcessed(
  eventId: string,
  source: WebhookSource
): Promise<boolean> {
  const existing = await prisma.webhookEvent.findUnique({
    where: { eventId_source: { eventId, source } },
  })
  return existing !== null
}

/**
 * Records that an event has been processed.
 * If a concurrent request already inserted the same event (race condition),
 * the unique constraint violation is caught and treated as a no-op.
 */
export async function markEventProcessed(
  eventId: string,
  source: WebhookSource,
  eventType: string
): Promise<void> {
  try {
    await prisma.webhookEvent.create({
      data: { eventId, source, eventType },
    })
  } catch (error: unknown) {
    // Prisma P2002 = unique constraint violation — another handler already recorded this event
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return
    }
    throw error
  }
}
