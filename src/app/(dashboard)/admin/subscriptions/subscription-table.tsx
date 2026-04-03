'use client'

import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  getStripeDashboardSubscriptionUrl,
  getStatusBadgeVariant,
  type AdminSubscriptionRow,
} from '@/domain/subscription/admin'
import type { SubscriptionStatus } from '@/domain/subscription/subscription'

const selectClassName =
  'h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'trialing', label: 'Trialing' },
  { value: 'past_due', label: 'Past Due' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'incomplete', label: 'Incomplete' },
  { value: 'incomplete_expired', label: 'Incomplete Expired' },
]

type SubscriptionTableProps = {
  rows: AdminSubscriptionRow[]
  plans: string[]
}

function formatStatus(status: SubscriptionStatus): string {
  return status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function SubscriptionTable({ rows, plans }: SubscriptionTableProps) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [emailSearch, setEmailSearch] = useState('')

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (planFilter !== 'all' && row.planName !== planFilter) return false
      if (
        emailSearch &&
        !row.email.toLowerCase().includes(emailSearch.toLowerCase())
      )
        return false
      return true
    })
  }, [rows, statusFilter, planFilter, emailSearch])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={selectClassName}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className={selectClassName}
        >
          <option value="all">All plans</option>
          {plans.map((plan) => (
            <option key={plan} value={plan}>
              {plan}
            </option>
          ))}
        </select>

        <Input
          placeholder="Search by email…"
          value={emailSearch}
          onChange={(e) => setEmailSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {filteredRows.length === 0 ? (
        <div className="rounded-lg border py-8 text-center text-muted-foreground">
          No subscriptions yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Interval</th>
                <th className="px-4 py-3 font-medium">Period End</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.stripeSubscriptionId}
                  className="border-b last:border-0"
                >
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3">{row.planName}</td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatusBadgeVariant(row.status)}>
                      {formatStatus(row.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 capitalize">{row.interval}</td>
                  <td className="px-4 py-3">
                    {new Date(row.periodEnd).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" asChild>
                      <a
                        href={getStripeDashboardSubscriptionUrl(
                          row.stripeSubscriptionId
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">
                          View in Stripe
                        </span>
                      </a>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
