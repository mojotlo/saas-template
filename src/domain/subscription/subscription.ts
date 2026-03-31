// Domain: Subscription
//
// Pure types and rules for subscription access control.
// No side effects, no external dependencies.
// Uses Money from the money domain for price representation.

import type { Money } from '../money/money'

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid'

export type BillingInterval = 'monthly' | 'annual'

export type Plan = {
  id: string
  name: string
  description: string
  priceMonthly: Money
  priceAnnual: Money
  features: string[]
}

export type Subscription = {
  id: string
  userId: string
  planId: string
  status: SubscriptionStatus
  billingInterval: BillingInterval
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
}

export class SubscriptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SubscriptionError'
  }
}

// A subscription grants access when it is in an active or trialing state.
export function hasActiveAccess(subscription: Subscription | null): boolean {
  if (!subscription) return false
  return subscription.status === 'active' || subscription.status === 'trialing'
}

// Returns true if the subscription will be canceled at the end of the period
// but is still currently granting access.
export function isCancelingAtPeriodEnd(subscription: Subscription): boolean {
  return hasActiveAccess(subscription) && subscription.cancelAtPeriodEnd
}

// Returns true if the subscription has lapsed and access should be denied.
export function isExpired(subscription: Subscription): boolean {
  if (hasActiveAccess(subscription)) return false
  return (
    subscription.status === 'canceled' ||
    subscription.status === 'incomplete_expired' ||
    subscription.status === 'unpaid'
  )
}

// Returns the effective price for a given billing interval.
export function getPriceForInterval(
  plan: Plan,
  interval: BillingInterval
): Money {
  return interval === 'monthly' ? plan.priceMonthly : plan.priceAnnual
}

// Returns the annual savings compared to paying monthly for 12 months.
export function annualSavings(plan: Plan): Money {
  const monthlyCostAnnualized = plan.priceMonthly.amount * 12
  const annualCost = plan.priceAnnual.amount
  const savings = monthlyCostAnnualized - annualCost
  return { amount: Math.max(savings, 0), currency: plan.priceMonthly.currency }
}

// Returns the percentage saved by paying annually vs monthly, rounded to nearest integer.
// Returns 0 if monthly is free or annual costs more.
export function annualSavingsPercent(monthlyAmount: number, annualAmount: number): number {
  if (monthlyAmount === 0) return 0
  const savings = monthlyAmount * 12 - annualAmount
  return Math.max(0, Math.round((savings / (monthlyAmount * 12)) * 100))
}

// Returns the billing interval inferred from a Stripe price ID.
// Requires the plan to look up which price ID corresponds to which interval.
export function inferBillingInterval(
  stripePriceId: string,
  monthlyPriceId: string,
  annualPriceId: string
): BillingInterval {
  if (stripePriceId === monthlyPriceId) return 'monthly'
  if (stripePriceId === annualPriceId) return 'annual'
  throw new SubscriptionError(
    `Unknown price ID: ${stripePriceId}. Expected ${monthlyPriceId} or ${annualPriceId}.`
  )
}
