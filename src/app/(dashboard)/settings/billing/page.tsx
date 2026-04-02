'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { annualSavingsPercent, type BillingInterval } from '@/domain/subscription/subscription'
import { cn } from '@/lib/utils'

type PricingPlan = {
  name: string
  description: string
  priceMonthly: number
  priceAnnual: number
  features: string[]
  highlighted: boolean
  stripePriceIdMonthly: string
  stripePriceIdAnnual: string
}

const plans: PricingPlan[] = [
  {
    name: 'Pro',
    description: 'For growing teams that need more power.',
    priceMonthly: 19,
    priceAnnual: 190,
    features: ['Unlimited projects', '50 GB storage', 'Advanced analytics', 'Priority support', 'Custom domain', 'API access'],
    highlighted: true,
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
    stripePriceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID ?? '',
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with advanced needs.',
    priceMonthly: 79,
    priceAnnual: 790,
    features: ['Everything in Pro', 'Unlimited storage', 'SSO / SAML', 'Dedicated support', 'SLA guarantee', 'Custom integrations', 'Audit logs'],
    highlighted: false,
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID ?? '',
    stripePriceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID ?? '',
  },
]

async function startCheckout(stripePriceId: string): Promise<string | null> {
  const res = await fetch('/api/billing/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stripePriceId }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to start checkout')
  return data.url ?? null
}

async function openPortal(): Promise<string | null> {
  const res = await fetch('/api/billing/portal', { method: 'POST' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to open billing portal')
  return data.url ?? null
}

export default function BillingPage() {
  const [interval, setInterval] = useState<BillingInterval>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function showError(err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong'
    setError(message)
    toast.error(message)
  }

  async function handleCheckout(plan: PricingPlan) {
    const priceId = interval === 'monthly' ? plan.stripePriceIdMonthly : plan.stripePriceIdAnnual
    setLoading(plan.name)
    setError(null)
    try {
      const url = await startCheckout(priceId)
      if (url) window.location.href = url
    } catch (err) {
      showError(err)
    } finally {
      setLoading(null)
    }
  }

  async function handlePortal() {
    setLoading('portal')
    setError(null)
    try {
      const url = await openPortal()
      if (url) window.location.href = url
    } catch (err) {
      showError(err)
    } finally {
      setLoading(null)
    }
  }

  // Use the highest savings % across all plans for the toggle badge
  const maxSavings = Math.max(
    ...plans.map((p) => annualSavingsPercent(p.priceMonthly, p.priceAnnual))
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="mt-1 text-muted-foreground">Manage your subscription and payment details.</p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Manage existing subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Current subscription</CardTitle>
          <CardDescription>
            View invoices, update your payment method, or cancel your plan.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={handlePortal} disabled={loading === 'portal'}>
            {loading === 'portal' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Manage subscription
          </Button>
        </CardFooter>
      </Card>

      <Separator />

      {/* Upgrade / switch plans */}
      <div>
        <h2 className="mb-2 text-xl font-semibold">Upgrade your plan</h2>
        <p className="mb-6 text-sm text-muted-foreground">Choose a plan that fits your needs.</p>

        {/* Interval toggle */}
        <div className="mb-6 inline-flex items-center rounded-full border bg-muted p-1">
          <button
            onClick={() => setInterval('monthly')}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              interval === 'monthly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval('annual')}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              interval === 'annual'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Annual
            {maxSavings > 0 && (
              <Badge variant="secondary" className="text-xs">
                Save {maxSavings}%
              </Badge>
            )}
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => {
            const price = interval === 'monthly' ? plan.priceMonthly : plan.priceAnnual
            const isLoading = loading === plan.name

            return (
              <Card
                key={plan.name}
                className={cn(
                  'flex flex-col',
                  plan.highlighted && 'border-primary ring-2 ring-primary'
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.highlighted && <Badge>Popular</Badge>}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">${price}</span>
                    <span className="text-muted-foreground">
                      /{interval === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? 'default' : 'outline'}
                    onClick={() => handleCheckout(plan)}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Subscribe to {plan.name}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
