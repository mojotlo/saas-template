import { describe, it, expect } from 'vitest'
import {
  createMoney,
  addMoney,
  subtractMoney,
  applyDiscount,
  formatMoney,
  isZero,
  isGreaterThan,
  MoneyError,
} from './money'

// These tests serve as documentation for how the money domain works.
// Every public function is tested, including all error branches.
// This is the standard to follow for all domain modules.

describe('createMoney', () => {
  it('creates a money value with valid inputs', () => {
    const money = createMoney(1000, 'USD')
    expect(money).toEqual({ amount: 1000, currency: 'USD' })
  })

  it('accepts zero amount', () => {
    const money = createMoney(0, 'USD')
    expect(money.amount).toBe(0)
  })

  it('throws if amount is not an integer', () => {
    expect(() => createMoney(10.5, 'USD')).toThrow(MoneyError)
    expect(() => createMoney(10.5, 'USD')).toThrow('Amount must be an integer')
  })

  it('throws if amount is negative', () => {
    expect(() => createMoney(-100, 'USD')).toThrow(MoneyError)
    expect(() => createMoney(-100, 'USD')).toThrow('Amount cannot be negative')
  })
})

describe('addMoney', () => {
  it('adds two money values of the same currency', () => {
    const a = createMoney(1000, 'USD')
    const b = createMoney(500, 'USD')
    expect(addMoney(a, b)).toEqual({ amount: 1500, currency: 'USD' })
  })

  it('throws when adding different currencies', () => {
    const usd = createMoney(1000, 'USD')
    const eur = createMoney(1000, 'EUR')
    expect(() => addMoney(usd, eur)).toThrow(MoneyError)
    expect(() => addMoney(usd, eur)).toThrow('Cannot add different currencies')
  })
})

describe('subtractMoney', () => {
  it('subtracts a smaller amount from a larger one', () => {
    const a = createMoney(1000, 'USD')
    const b = createMoney(300, 'USD')
    expect(subtractMoney(a, b)).toEqual({ amount: 700, currency: 'USD' })
  })

  it('allows subtracting equal amounts resulting in zero', () => {
    const a = createMoney(500, 'GBP')
    const b = createMoney(500, 'GBP')
    expect(subtractMoney(a, b)).toEqual({ amount: 0, currency: 'GBP' })
  })

  it('throws when result would be negative', () => {
    const a = createMoney(100, 'USD')
    const b = createMoney(200, 'USD')
    expect(() => subtractMoney(a, b)).toThrow(MoneyError)
    expect(() => subtractMoney(a, b)).toThrow('result would be negative')
  })

  it('throws when subtracting different currencies', () => {
    const usd = createMoney(1000, 'USD')
    const eur = createMoney(500, 'EUR')
    expect(() => subtractMoney(usd, eur)).toThrow(MoneyError)
    expect(() => subtractMoney(usd, eur)).toThrow('Cannot subtract different currencies')
  })
})

describe('applyDiscount', () => {
  it('applies a percentage discount', () => {
    const price = createMoney(1000, 'USD')
    expect(applyDiscount(price, 10)).toEqual({ amount: 900, currency: 'USD' })
  })

  it('applies 100% discount resulting in zero', () => {
    const price = createMoney(1000, 'USD')
    expect(applyDiscount(price, 100)).toEqual({ amount: 0, currency: 'USD' })
  })

  it('applies 0% discount leaving amount unchanged', () => {
    const price = createMoney(1000, 'USD')
    expect(applyDiscount(price, 0)).toEqual({ amount: 1000, currency: 'USD' })
  })

  it('rounds to nearest cent', () => {
    const price = createMoney(1000, 'USD')
    // 33% off 1000 = 670 (rounds from 670.0)
    expect(applyDiscount(price, 33)).toEqual({ amount: 670, currency: 'USD' })
  })

  it('throws if discount is below 0', () => {
    const price = createMoney(1000, 'USD')
    expect(() => applyDiscount(price, -1)).toThrow(MoneyError)
    expect(() => applyDiscount(price, -1)).toThrow('Discount must be between 0 and 100')
  })

  it('throws if discount is above 100', () => {
    const price = createMoney(1000, 'USD')
    expect(() => applyDiscount(price, 101)).toThrow(MoneyError)
    expect(() => applyDiscount(price, 101)).toThrow('Discount must be between 0 and 100')
  })
})

describe('formatMoney', () => {
  it('formats USD with dollar sign', () => {
    expect(formatMoney(createMoney(1000, 'USD'))).toBe('$10.00')
  })

  it('formats EUR with euro sign', () => {
    expect(formatMoney(createMoney(2050, 'EUR'))).toBe('€20.50')
  })

  it('formats GBP with pound sign', () => {
    expect(formatMoney(createMoney(500, 'GBP'))).toBe('£5.00')
  })

  it('formats CAD with CA$ prefix', () => {
    expect(formatMoney(createMoney(750, 'CAD'))).toBe('CA$7.50')
  })

  it('formats zero correctly', () => {
    expect(formatMoney(createMoney(0, 'USD'))).toBe('$0.00')
  })
})

describe('isZero', () => {
  it('returns true for zero amount', () => {
    expect(isZero(createMoney(0, 'USD'))).toBe(true)
  })

  it('returns false for non-zero amount', () => {
    expect(isZero(createMoney(1, 'USD'))).toBe(false)
  })
})

describe('isGreaterThan', () => {
  it('returns true when first amount is larger', () => {
    const a = createMoney(1000, 'USD')
    const b = createMoney(500, 'USD')
    expect(isGreaterThan(a, b)).toBe(true)
  })

  it('returns false when first amount is smaller', () => {
    const a = createMoney(500, 'USD')
    const b = createMoney(1000, 'USD')
    expect(isGreaterThan(a, b)).toBe(false)
  })

  it('returns false when amounts are equal', () => {
    const a = createMoney(1000, 'USD')
    const b = createMoney(1000, 'USD')
    expect(isGreaterThan(a, b)).toBe(false)
  })

  it('throws when comparing different currencies', () => {
    const usd = createMoney(1000, 'USD')
    const eur = createMoney(500, 'EUR')
    expect(() => isGreaterThan(usd, eur)).toThrow(MoneyError)
    expect(() => isGreaterThan(usd, eur)).toThrow('Cannot compare different currencies')
  })
})
