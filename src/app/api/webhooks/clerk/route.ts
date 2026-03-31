import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { prisma } from '@/infrastructure/database/client'
import type { WebhookEvent } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    return new Response('CLERK_WEBHOOK_SECRET is not set', { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(webhookSecret)
  let event: WebhookEvent

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch {
    return new Response('Invalid webhook signature', { status: 400 })
  }

  switch (event.type) {
    case 'user.created': {
      const { id, email_addresses } = event.data
      const primaryEmail = email_addresses.find((e) => e.id === event.data.primary_email_address_id)
      if (!primaryEmail) break

      await prisma.user.create({
        data: {
          id,
          email: primaryEmail.email_address,
        },
      })
      break
    }

    case 'user.updated': {
      const { id, email_addresses } = event.data
      const primaryEmail = email_addresses.find((e) => e.id === event.data.primary_email_address_id)
      if (!primaryEmail) break

      await prisma.user.upsert({
        where: { id },
        create: { id, email: primaryEmail.email_address },
        update: { email: primaryEmail.email_address },
      })
      break
    }

    case 'user.deleted': {
      const { id } = event.data
      if (!id) break

      // deleteMany is a no-op if the user doesn't exist — avoids the not-found error
      await prisma.user.deleteMany({ where: { id } })
      break
    }
  }

  return new Response('OK', { status: 200 })
}
