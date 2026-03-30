// Domain: Money
//
// Pure functions for monetary calculations.
// No side effects, no external dependencies.
// All amounts are stored as integers in the smallest currency unit (e.g. cents).
// This avoids floating point precision errors.

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD'

export type Money = {
  amount: number // in smallest unit (cents)
  currency: Currency
}

export class MoneyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MoneyError'
  }
}

export function createMoney(amount: number, currency: Currency): Money {
  if (!Number.isInteger(amount)) {
    throw new MoneyError(
      `Amount must be an integer (cents), got ${amount}. Use 100 for $1.00.`
    )
  }
  if (amount < 0) {
    throw new MoneyError(`Amount cannot be negative, got ${amount}`)
  }
  return { amount, currency }
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new MoneyError(
      `Cannot add different currencies: ${a.currency} and ${b.currency}`
    )
  }
  return { amount: a.amount + b.amount, currency: a.currency }
}

export function subtractMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new MoneyError(
      `Cannot subtract different currencies: ${a.currency} and ${b.currency}`
    )
  }
  if (b.amount > a.amount) {
    throw new MoneyError(
      `Cannot subtract ${formatMoney(b)} from ${formatMoney(a)}: result would be negative`
    )
  }
  return { amount: a.amount - b.amount, currency: a.currency }
}

export function applyDiscount(money: Money, percentOff: number): Money {
  if (percentOff < 0 || percentOff > 100) {
    throw new MoneyError(`Discount must be between 0 and 100, got ${percentOff}`)
  }
  const discounted = Math.round(money.amount * (1 - percentOff / 100))
  return { amount: discounted, currency: money.currency }
}

export function formatMoney(money: Money): string {
  const formatted = (money.amount / 100).toFixed(2)
  const symbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
  }
  return `${symbols[money.currency]}${formatted}`
}

export function isZero(money: Money): boolean {
  return money.amount === 0
}

export function isGreaterThan(a: Money, b: Money): boolean {
  if (a.currency !== b.currency) {
    throw new MoneyError(
      `Cannot compare different currencies: ${a.currency} and ${b.currency}`
    )
  }
  return a.amount > b.amount
}
