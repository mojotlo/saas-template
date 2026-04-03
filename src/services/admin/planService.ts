import {
  validatePlanInput,
  validateCurrency,
  parseFeatures,
  type PlanInput,
} from '@/domain/plan/plan'
import { validateStripePriceActive } from '@/infrastructure/stripe/prices'
import {
  createPlan as dbCreatePlan,
  updatePlan as dbUpdatePlan,
  deletePlan as dbDeletePlan,
  getPlanById,
  findPlanByStripePriceId,
  type CreatePlanData,
} from '@/infrastructure/database/plan-queries'

export class PlanServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: Array<{ field: string; message: string }>
  ) {
    super(message)
    this.name = 'PlanServiceError'
  }
}

async function validateAndResolvePrices(
  input: PlanInput,
  excludePlanId?: string
): Promise<CreatePlanData> {
  const validationErrors = validatePlanInput(input)
  if (validationErrors.length > 0) {
    throw new PlanServiceError('Validation failed', 400, validationErrors)
  }

  const [monthlyPrice, annualPrice, existingMonthly, existingAnnual] =
    await Promise.all([
      validateStripePriceActive(input.stripePriceIdMonthly),
      validateStripePriceActive(input.stripePriceIdAnnual),
      findPlanByStripePriceId(input.stripePriceIdMonthly),
      findPlanByStripePriceId(input.stripePriceIdAnnual),
    ])

  const monthlyCurrency = monthlyPrice.currency.toUpperCase()
  const currencyError = validateCurrency(monthlyCurrency)
  if (currencyError) {
    throw new PlanServiceError(currencyError.message, 400)
  }

  const annualCurrency = annualPrice.currency.toUpperCase()
  const annualCurrencyError = validateCurrency(annualCurrency)
  if (annualCurrencyError) {
    throw new PlanServiceError(annualCurrencyError.message, 400)
  }

  if (existingMonthly && existingMonthly.id !== excludePlanId) {
    throw new PlanServiceError('Stripe price ID already in use', 400)
  }
  if (existingAnnual && existingAnnual.id !== excludePlanId) {
    throw new PlanServiceError('Stripe price ID already in use', 400)
  }

  return {
    name: input.name.trim(),
    description: input.description.trim(),
    stripePriceIdMonthly: input.stripePriceIdMonthly,
    stripePriceIdAnnual: input.stripePriceIdAnnual,
    amountMonthly: monthlyPrice.unitAmount,
    amountAnnual: annualPrice.unitAmount,
    currency: monthlyCurrency,
    features: parseFeatures(input.features),
    sortOrder: input.sortOrder,
  }
}

export async function createPlan(input: PlanInput) {
  const data = await validateAndResolvePrices(input)
  return dbCreatePlan(data)
}

export async function updatePlan(id: string, input: PlanInput) {
  const existing = await getPlanById(id)
  if (!existing) {
    throw new PlanServiceError('Plan not found', 404)
  }

  const data = await validateAndResolvePrices(input, id)
  return dbUpdatePlan(id, data)
}

export async function removePlan(id: string) {
  const existing = await getPlanById(id)
  if (!existing) {
    throw new PlanServiceError('Plan not found', 404)
  }

  if (existing._count.subscriptions > 0) {
    throw new PlanServiceError(
      'Cannot delete plan with active subscriptions',
      409
    )
  }

  return dbDeletePlan(id)
}
