'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  getClerkDashboardUrl,
  getStripeDashboardCustomerUrl,
  type UserRow,
} from '@/domain/user/user'

function ExternalDashboardLink({
  href,
  label,
}: {
  href: string
  label: string
}): React.JSX.Element {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      {label}
      <ExternalLink className="h-3 w-3" />
    </a>
  )
}

const STATUS_FILTER_OPTIONS = [
  'All',
  'Active',
  'Trialing',
  'Canceling',
  'Canceled',
  'Past Due',
  'Unpaid',
  'No Subscription',
] as const

function getStatusBadgeVariant(
  statusLabel: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (statusLabel) {
    case 'Active':
      return 'default'
    case 'Trialing':
      return 'secondary'
    case 'Canceling':
      return 'outline'
    case 'Canceled':
    case 'Past Due':
    case 'Unpaid':
    case 'Incomplete':
    case 'Incomplete Expired':
      return 'destructive'
    default:
      return 'secondary'
  }
}

type UserTableProps = {
  users: UserRow[]
}

export function UserTable({ users }: UserTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = users.filter((user) => {
    const matchesSearch = user.email
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === 'All' || user.statusLabel === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-muted-foreground">
          View all users and their subscription status.
        </p>
      </div>

      {users.length === 0 ? (
        <div className="rounded-lg border py-8 text-center text-muted-foreground">
          No users yet.
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-4">
            <Input
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border py-8 text-center text-muted-foreground">
              No users match the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{user.email}</td>
                      <td className="px-4 py-3">
                        {user.planName ?? (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatusBadgeVariant(user.statusLabel)}>
                          {user.statusLabel}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {user.joinedDate}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ExternalDashboardLink
                            href={getClerkDashboardUrl(user.id)}
                            label="Clerk"
                          />
                          {user.stripeCustomerId && (
                            <ExternalDashboardLink
                              href={getStripeDashboardCustomerUrl(
                                user.stripeCustomerId
                              )}
                              label="Stripe"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}
