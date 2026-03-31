import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/infrastructure/database/client'
import {
  hasActiveAccess,
  inferBillingInterval,
  type Subscription,
  type SubscriptionStatus,
} from '@/domain/subscription/subscription'
import { formatMoney, createMoney } from '@/domain/money/money'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const VALID_STATUSES: SubscriptionStatus[] = [
  'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid',
]

function toDomainSubscription(dbSub: {
  id: string
  userId: string
  planId: string
  status: string
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  stripePriceId: string
  plan: { stripePriceIdMonthly: string; stripePriceIdAnnual: string }
}): Subscription {
  if (!VALID_STATUSES.includes(dbSub.status as SubscriptionStatus)) {
    throw new Error(`Unrecognised subscription status in database: "${dbSub.status}"`)
  }
  return {
    id: dbSub.id,
    userId: dbSub.userId,
    planId: dbSub.planId,
    status: dbSub.status as SubscriptionStatus,
    billingInterval: inferBillingInterval(
      dbSub.stripePriceId,
      dbSub.plan.stripePriceIdMonthly,
      dbSub.plan.stripePriceIdAnnual
    ),
    currentPeriodEnd: dbSub.currentPeriodEnd,
    cancelAtPeriodEnd: dbSub.cancelAtPeriodEnd,
  }
}

export default async function DashboardPage() {
  const clerkUser = await currentUser()
  if (!clerkUser) redirect('/sign-in')

  const user = await prisma.user.findUnique({
    where: { id: clerkUser.id },
    include: { subscription: { include: { plan: true } } },
  })

  const dbSub = user?.subscription ?? null
  const domainSub = dbSub ? toDomainSubscription(dbSub) : null
  const isActive = hasActiveAccess(domainSub)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {clerkUser.firstName ?? 'there'}
        </h1>
        <p className="mt-1 text-muted-foreground">Here&apos;s an overview of your account.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current plan</CardDescription>
            <CardTitle className="text-2xl">{dbSub?.plan.name ?? 'Starter'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant={isActive ? 'default' : 'secondary'}>
                {dbSub?.status ?? 'free'}
              </Badge>
              <Button variant="link" size="sm" className="p-0" asChild>
                <Link href="/dashboard/settings/billing">Manage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {dbSub && (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Next billing date</CardDescription>
              <CardTitle className="text-2xl">
                {dbSub.currentPeriodEnd.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {dbSub.cancelAtPeriodEnd ? 'Cancels at period end' : 'Auto-renews'}
              </p>
            </CardContent>
          </Card>
        )}

        {dbSub?.plan && (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Monthly spend</CardDescription>
              <CardTitle className="text-2xl">
                {formatMoney(createMoney(dbSub.plan.amountMonthly, 'USD'))}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{dbSub.plan.name} plan</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
