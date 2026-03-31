import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createCheckoutSession } from '@/services/billing/checkoutService'

export async function POST(req: Request) {
  const user = await currentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { stripePriceId } = await req.json()

  if (!stripePriceId || typeof stripePriceId !== 'string') {
    return NextResponse.json({ error: 'stripePriceId is required' }, { status: 400 })
  }

  const primaryEmail = user.primaryEmailAddress

  if (!primaryEmail) {
    return NextResponse.json({ error: 'No email address on user' }, { status: 400 })
  }

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? ''

  try {
    const { url } = await createCheckoutSession({
      userId: user.id,
      userEmail: primaryEmail.emailAddress,
      stripePriceId,
      successUrl: `${origin}/dashboard?checkout=success`,
      cancelUrl: `${origin}/dashboard/settings/billing`,
    })
    return NextResponse.json({ url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
