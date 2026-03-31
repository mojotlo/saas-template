import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createPortalSession } from '@/services/billing/portalService'

export async function POST(req: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? ''

  try {
    const { url } = await createPortalSession({
      userId,
      returnUrl: `${origin}/dashboard/settings/billing`,
    })
    return NextResponse.json({ url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create portal session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
