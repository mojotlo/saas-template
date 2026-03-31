// Service: Customer Portal
//
// Creates a Stripe Billing Portal session so a user can manage their subscription.
// Requires the user to already have a Stripe customer ID (set after first checkout).

import { stripe } from '../../infrastructure/stripe/client'
import { prisma } from '../../infrastructure/database/client'

type CreatePortalSessionParams = {
  userId: string
  returnUrl: string
}

type PortalSessionResult = {
  url: string
}

export async function createPortalSession(
  params: CreatePortalSessionParams
): Promise<PortalSessionResult> {
  const { userId, returnUrl } = params

  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user?.stripeCustomerId) {
    throw new Error(`User ${userId} has no Stripe customer ID. Cannot open billing portal.`)
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl,
  })

  return { url: session.url }
}
