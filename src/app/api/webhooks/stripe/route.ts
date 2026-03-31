import { headers } from 'next/headers'
import { stripe } from '@/infrastructure/stripe/client'
import { prisma } from '@/infrastructure/database/client'
import { syncSubscription, deleteSubscription } from '@/services/billing/subscriptionSyncService'
import type Stripe from 'stripe'

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return new Response('STRIPE_WEBHOOK_SECRET is not set', { status: 500 })
  }

  const body = await req.text()
  const headerPayload = await headers()
  const signature = headerPayload.get('stripe-signature')

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return new Response('Invalid webhook signature', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const userId = session.client_reference_id
      const customerId = session.customer as string

      if (userId && customerId) {
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customerId },
        })
      }
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      await syncSubscription(subscription)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await deleteSubscription(subscription.id)
      break
    }
  }

  return new Response('OK', { status: 200 })
}
