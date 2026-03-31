// Service: Checkout
//
// Creates a Stripe Checkout Session for a subscription.
// Orchestrates: Stripe API + Prisma (read user's stripeCustomerId).

import { stripe } from '../../infrastructure/stripe/client'
import { prisma } from '../../infrastructure/database/client'

type CreateCheckoutSessionParams = {
  userId: string
  userEmail: string
  stripePriceId: string
  successUrl: string
  cancelUrl: string
}

type CheckoutSessionResult = {
  url: string
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CheckoutSessionResult> {
  const { userId, userEmail, stripePriceId, successUrl, cancelUrl } = params

  // Re-use existing Stripe customer if one exists for this user
  const user = await prisma.user.findUnique({ where: { id: userId } })
  const customerId = user?.stripeCustomerId ?? undefined

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    customer_email: customerId ? undefined : userEmail,
    client_reference_id: userId,
    line_items: [{ price: stripePriceId, quantity: 1 }],
    subscription_data: {
      metadata: { userId },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  })

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL')
  }

  return { url: session.url }
}
