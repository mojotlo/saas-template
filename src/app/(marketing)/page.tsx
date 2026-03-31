'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { annualSavingsPercent, type BillingInterval } from '@/domain/subscription/subscription'
import { cn } from '@/lib/utils'

type PricingPlan = {
  name: string
  description: string
  priceMonthly: number
  priceAnnual: number
  features: string[]
  highlighted: boolean
  ctaLabel: string
  stripePriceIdMonthly: string
  stripePriceIdAnnual: string
}

// Replace price IDs with your actual Stripe price IDs
const plans: PricingPlan[] = [
  {
    name: 'Starter',
    description: 'Perfect for individuals and small projects.',
    priceMonthly: 0,
    priceAnnual: 0,
    features: ['Up to 3 projects', '1 GB storage', 'Basic analytics', 'Email support'],
    highlighted: false,
    ctaLabel: 'Get started free',
    stripePriceIdMonthly: '',
    stripePriceIdAnnual: '',
  },
  {
    name: 'Pro',
    description: 'For growing teams that need more power.',
    priceMonthly: 19,
    priceAnnual: 190,
    features: [
      'Unlimited projects',
      '50 GB storage',
      'Advanced analytics',
      'Priority support',
      'Custom domain',
      'API access',
    ],
    highlighted: true,
    ctaLabel: 'Start Pro trial',
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
    stripePriceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID ?? '',
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with advanced needs.',
    priceMonthly: 79,
    priceAnnual: 790,
    features: [
      'Everything in Pro',
      'Unlimited storage',
      'SSO / SAML',
      'Dedicated support',
      'SLA guarantee',
      'Custom integrations',
      'Audit logs',
    ],
    highlighted: false,
    ctaLabel: 'Contact sales',
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID ?? '',
    stripePriceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID ?? '',
  },
]

function formatPrice(dollars: number): string {
  return `$${dollars}`
}

export default function HomePage() {
  const [interval, setInterval] = useState<BillingInterval>('monthly')

  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full py-24 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <Badge variant="secondary" className="mb-4">
            Now in beta
          </Badge>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground">
            The SaaS starter kit
            <br />
            you&apos;ve been waiting for
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Ship your SaaS faster with Next.js, Clerk auth, and Stripe billing — all wired up and
            ready to go.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/sign-up">Start building free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="w-full py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight">Simple, transparent pricing</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Start free. Upgrade when you need to.
            </p>

            {/* Billing interval toggle */}
            <div className="inline-flex items-center rounded-full border bg-muted p-1">
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
                <Badge variant="secondary" className="text-xs">
                  Save up to 17%
                </Badge>
              </button>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => {
              const price = interval === 'monthly' ? plan.priceMonthly : plan.priceAnnual
              const savings = annualSavingsPercent(plan.priceMonthly, plan.priceAnnual)

              return (
                <Card
                  key={plan.name}
                  className={cn(
                    'relative flex flex-col',
                    plan.highlighted && 'border-primary shadow-lg ring-2 ring-primary'
                  )}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="px-3 py-1">Most popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        {price === 0 ? 'Free' : formatPrice(price)}
                      </span>
                      {price > 0 && (
                        <span className="text-muted-foreground">
                          /{interval === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      )}
                      {interval === 'annual' && savings > 0 && (
                        <p className="mt-1 text-sm text-primary">Save {savings}% vs monthly</p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
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
                      asChild
                    >
                      <Link href="/sign-up">
                        {plan.ctaLabel}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
