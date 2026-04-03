// Infrastructure: Stripe Prices
//
// Fetches price data from the Stripe API.
// No business logic — raw data retrieval only.

import { stripe } from './client'

export type StripePrice = {
  id: string
  unitAmount: number
  currency: string
  interval: string
  productName: string
}

export async function getActiveRecurringPrices(): Promise<StripePrice[]> {
  try {
    const response = await stripe.prices.list({
      active: true,
      type: 'recurring',
      expand: ['data.product'],
      limit: 100,
    })

    return response.data.map((price) => {
      const product =
        price.product && typeof price.product === 'object'
          ? price.product
          : null
      const productName =
        product && 'name' in product ? (product.name ?? 'Unknown') : 'Unknown'

      return {
        id: price.id,
        unitAmount: price.unit_amount ?? 0,
        currency: price.currency,
        interval: price.recurring?.interval ?? 'month',
        productName,
      }
    })
  } catch (error) {
    console.error('Failed to fetch prices from Stripe:', error)
    throw new Error('Failed to fetch prices from Stripe')
  }
}

export async function validateStripePriceActive(
  priceId: string
): Promise<{ unitAmount: number; currency: string; interval: string }> {
  try {
    const price = await stripe.prices.retrieve(priceId)

    if (!price.active) {
      throw new Error(`Stripe price ${priceId} is not active`)
    }

    if (price.type !== 'recurring') {
      throw new Error(`Stripe price ${priceId} is not a recurring price`)
    }

    return {
      unitAmount: price.unit_amount ?? 0,
      currency: price.currency,
      interval: price.recurring?.interval ?? 'month',
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Stripe price')) {
      throw error
    }
    throw new Error(`Stripe price ${priceId} not found or inaccessible`)
  }
}
