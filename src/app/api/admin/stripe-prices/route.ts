import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getActiveRecurringPrices } from '@/infrastructure/stripe/prices'

export async function GET() {
  const user = await currentUser()

  if (!user || user.publicMetadata.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const prices = await getActiveRecurringPrices()
    return NextResponse.json({ prices })
  } catch {
    return NextResponse.json(
      {
        error:
          "Couldn't load Stripe prices. Make sure you have active recurring prices in your Stripe account and that your STRIPE_SECRET_KEY is correct.",
      },
      { status: 500 }
    )
  }
}
