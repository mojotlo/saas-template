import { describe, it, expect } from 'vitest'
import {
  validatePlanInput,
  validateCurrency,
  parseFeatures,
  type PlanInput,
} from './plan'

function makeInput(overrides: Partial<PlanInput> = {}): PlanInput {
  return {
    name: 'Pro',
    description: 'Pro plan',
    stripePriceIdMonthly: 'price_monthly_123',
    stripePriceIdAnnual: 'price_annual_456',
    features: 'Feature A\nFeature B',
    sortOrder: 1,
    ...overrides,
  }
}

describe('validatePlanInput', () => {
  it('returns no errors for valid input', () => {
    expect(validatePlanInput(makeInput())).toEqual([])
  })

  it('returns error when name is empty', () => {
    const errors = validatePlanInput(makeInput({ name: '' }))
    expect(errors).toContainEqual({
      field: 'name',
      message: 'Name is required',
    })
  })

  it('returns error when name is whitespace-only', () => {
    const errors = validatePlanInput(makeInput({ name: '   ' }))
    expect(errors).toContainEqual({
      field: 'name',
      message: 'Name is required',
    })
  })

  it('returns error when monthly price is empty', () => {
    const errors = validatePlanInput(makeInput({ stripePriceIdMonthly: '' }))
    expect(errors).toContainEqual({
      field: 'stripePriceIdMonthly',
      message: 'Monthly price is required',
    })
  })

  it('returns error when annual price is empty', () => {
    const errors = validatePlanInput(makeInput({ stripePriceIdAnnual: '' }))
    expect(errors).toContainEqual({
      field: 'stripePriceIdAnnual',
      message: 'Annual price is required',
    })
  })

  it('returns error when monthly and annual price IDs are the same', () => {
    const errors = validatePlanInput(
      makeInput({
        stripePriceIdMonthly: 'price_same',
        stripePriceIdAnnual: 'price_same',
      })
    )
    expect(errors).toContainEqual({
      field: 'stripePriceIdAnnual',
      message: 'Monthly and annual price IDs must be different',
    })
  })

  it('does not return same-ID error when both are empty', () => {
    const errors = validatePlanInput(
      makeInput({
        stripePriceIdMonthly: '',
        stripePriceIdAnnual: '',
      })
    )
    const sameIdError = errors.find(
      (e) => e.message === 'Monthly and annual price IDs must be different'
    )
    expect(sameIdError).toBeUndefined()
  })

  it('returns multiple errors when multiple fields are invalid', () => {
    const errors = validatePlanInput(
      makeInput({
        name: '',
        stripePriceIdMonthly: '',
      })
    )
    expect(errors.length).toBe(2)
  })
})

describe('validateCurrency', () => {
  it('returns null for supported currencies', () => {
    expect(validateCurrency('USD')).toBeNull()
    expect(validateCurrency('EUR')).toBeNull()
    expect(validateCurrency('GBP')).toBeNull()
    expect(validateCurrency('CAD')).toBeNull()
  })

  it('returns null for lowercase supported currency', () => {
    expect(validateCurrency('usd')).toBeNull()
  })

  it('returns error for unsupported currency', () => {
    const error = validateCurrency('JPY')
    expect(error).toEqual({
      field: 'currency',
      message: 'Unsupported currency: JPY. Supported: USD, EUR, GBP, CAD',
    })
  })
})

describe('parseFeatures', () => {
  it('returns empty array for empty string', () => {
    expect(parseFeatures('')).toEqual([])
  })

  it('returns empty array for whitespace-only string', () => {
    expect(parseFeatures('   \n  \n  ')).toEqual([])
  })

  it('parses single feature', () => {
    expect(parseFeatures('Unlimited access')).toEqual(['Unlimited access'])
  })

  it('parses multiple features separated by newlines', () => {
    expect(parseFeatures('Feature A\nFeature B\nFeature C')).toEqual([
      'Feature A',
      'Feature B',
      'Feature C',
    ])
  })

  it('trims whitespace from each line', () => {
    expect(parseFeatures('  Feature A  \n  Feature B  ')).toEqual([
      'Feature A',
      'Feature B',
    ])
  })

  it('filters out blank lines', () => {
    expect(parseFeatures('Feature A\n\n\nFeature B')).toEqual([
      'Feature A',
      'Feature B',
    ])
  })
})
