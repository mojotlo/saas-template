import { isSupportedCurrency, SUPPORTED_CURRENCIES } from '../money/money'

export type PlanInput = {
  name: string
  description: string
  stripePriceIdMonthly: string
  stripePriceIdAnnual: string
  features: string
  sortOrder: number
}

export type PlanValidationError = {
  field: string
  message: string
}

export function validatePlanInput(input: PlanInput): PlanValidationError[] {
  const errors: PlanValidationError[] = []

  if (!input.name.trim()) {
    errors.push({ field: 'name', message: 'Name is required' })
  }

  if (!input.stripePriceIdMonthly.trim()) {
    errors.push({
      field: 'stripePriceIdMonthly',
      message: 'Monthly price is required',
    })
  }

  if (!input.stripePriceIdAnnual.trim()) {
    errors.push({
      field: 'stripePriceIdAnnual',
      message: 'Annual price is required',
    })
  }

  if (
    input.stripePriceIdMonthly.trim() &&
    input.stripePriceIdAnnual.trim() &&
    input.stripePriceIdMonthly === input.stripePriceIdAnnual
  ) {
    errors.push({
      field: 'stripePriceIdAnnual',
      message: 'Monthly and annual price IDs must be different',
    })
  }

  return errors
}

export function validateCurrency(currency: string): PlanValidationError | null {
  if (!isSupportedCurrency(currency)) {
    const supported = SUPPORTED_CURRENCIES.join(', ')
    return {
      field: 'currency',
      message: `Unsupported currency: ${currency}. Supported: ${supported}`,
    }
  }
  return null
}

export function parseFeatures(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}
