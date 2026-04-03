import { getAllSubscriptionsWithDetails } from '@/infrastructure/database/subscription-queries'
import {
  calculateMrr,
  getSubscriptionStatusCounts,
  mapSubscriptionRow,
  toMrrLineItem,
} from '@/domain/subscription/admin'
import type { SubscriptionStatus } from '@/domain/subscription/subscription'
import { StatCards } from './stat-cards'
import { SubscriptionTable } from './subscription-table'

export default async function SubscriptionsPage() {
  const rawSubscriptions = await getAllSubscriptionsWithDetails()

  const rows = []
  const mrrLineItems = []
  const statuses: SubscriptionStatus[] = []

  for (const sub of rawSubscriptions) {
    const typed = { ...sub, status: sub.status as SubscriptionStatus }
    rows.push(mapSubscriptionRow(typed))
    mrrLineItems.push(toMrrLineItem(typed))
    statuses.push(typed.status)
  }

  const mrr = calculateMrr(mrrLineItems)
  const counts = getSubscriptionStatusCounts(statuses)
  const plans = [...new Set(rows.map((r) => r.planName))]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="mt-1 text-muted-foreground">
          Stripe subscription overview.
        </p>
      </div>
      <StatCards
        activeCount={counts.active}
        mrr={mrr}
        trialingCount={counts.trialing}
        pastDueCount={counts.pastDue}
      />
      <SubscriptionTable rows={rows} plans={plans} />
    </div>
  )
}
