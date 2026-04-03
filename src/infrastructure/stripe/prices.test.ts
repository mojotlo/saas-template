import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./client', () => ({
  stripe: {
    prices: {
      list: vi.fn(),
      retrieve: vi.fn(),
    },
  },
}))

import { stripe } from './client'
import { getActiveRecurringPrices, validateStripePriceActive } from './prices'

const mockList = vi.mocked(stripe.prices.list)
const mockRetrieve = vi.mocked(stripe.prices.retrieve)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getActiveRecurringPrices', () => {
  it('returns mapped prices on success', async () => {
    mockList.mockResolvedValue({
      data: [
        {
          id: 'price_monthly',
          unit_amount: 1900,
          currency: 'usd',
          recurring: { interval: 'month' },
          product: { name: 'Pro Plan' },
        },
        {
          id: 'price_annual',
          unit_amount: 19000,
          currency: 'usd',
          recurring: { interval: 'year' },
          product: { name: 'Pro Plan' },
        },
      ],
    } as never)

    const result = await getActiveRecurringPrices()

    expect(result).toEqual([
      {
        id: 'price_monthly',
        unitAmount: 1900,
        currency: 'usd',
        interval: 'month',
        productName: 'Pro Plan',
      },
      {
        id: 'price_annual',
        unitAmount: 19000,
        currency: 'usd',
        interval: 'year',
        productName: 'Pro Plan',
      },
    ])
  })

  it('returns empty array when no prices exist', async () => {
    mockList.mockResolvedValue({ data: [] } as never)

    const result = await getActiveRecurringPrices()

    expect(result).toEqual([])
  })

  it('handles product as string ID (not expanded)', async () => {
    mockList.mockResolvedValue({
      data: [
        {
          id: 'price_123',
          unit_amount: 999,
          currency: 'eur',
          recurring: { interval: 'month' },
          product: 'prod_abc',
        },
      ],
    } as never)

    const result = await getActiveRecurringPrices()

    expect(result[0].productName).toBe('Unknown')
  })

  it('handles null unit_amount', async () => {
    mockList.mockResolvedValue({
      data: [
        {
          id: 'price_free',
          unit_amount: null,
          currency: 'usd',
          recurring: { interval: 'month' },
          product: { name: 'Free' },
        },
      ],
    } as never)

    const result = await getActiveRecurringPrices()

    expect(result[0].unitAmount).toBe(0)
  })

  it('passes correct params to Stripe', async () => {
    mockList.mockResolvedValue({ data: [] } as never)

    await getActiveRecurringPrices()

    expect(mockList).toHaveBeenCalledWith({
      active: true,
      type: 'recurring',
      expand: ['data.product'],
      limit: 100,
    })
  })

  it('throws when Stripe API errors', async () => {
    mockList.mockRejectedValue(new Error('Stripe network error'))

    await expect(getActiveRecurringPrices()).rejects.toThrow(
      'Failed to fetch prices from Stripe'
    )
  })
})

describe('validateStripePriceActive', () => {
  it('returns price details for active recurring price', async () => {
    mockRetrieve.mockResolvedValue({
      id: 'price_123',
      active: true,
      type: 'recurring',
      unit_amount: 1900,
      currency: 'usd',
      recurring: { interval: 'month' },
    } as never)

    const result = await validateStripePriceActive('price_123')

    expect(result).toEqual({
      unitAmount: 1900,
      currency: 'usd',
      interval: 'month',
    })
  })

  it('throws for inactive price', async () => {
    mockRetrieve.mockResolvedValue({
      id: 'price_123',
      active: false,
      type: 'recurring',
      unit_amount: 1900,
      currency: 'usd',
      recurring: { interval: 'month' },
    } as never)

    await expect(validateStripePriceActive('price_123')).rejects.toThrow(
      'Stripe price price_123 is not active'
    )
  })

  it('throws for non-recurring price', async () => {
    mockRetrieve.mockResolvedValue({
      id: 'price_123',
      active: true,
      type: 'one_time',
      unit_amount: 1900,
      currency: 'usd',
    } as never)

    await expect(validateStripePriceActive('price_123')).rejects.toThrow(
      'Stripe price price_123 is not a recurring price'
    )
  })

  it('throws when price not found', async () => {
    mockRetrieve.mockRejectedValue(new Error('No such price'))

    await expect(validateStripePriceActive('price_bad')).rejects.toThrow(
      'Stripe price price_bad not found or inaccessible'
    )
  })
})
