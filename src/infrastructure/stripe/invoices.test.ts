import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./client', () => ({
  stripe: {
    invoices: {
      list: vi.fn(),
    },
  },
}))

import { stripe } from './client'
import { getInvoices } from './invoices'

const mockList = vi.mocked(stripe.invoices.list)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getInvoices', () => {
  it('returns array of invoice data on success', async () => {
    mockList.mockResolvedValue({
      data: [
        {
          id: 'in_123',
          created: 1700000000,
          amount_due: 1900,
          currency: 'usd',
          status: 'paid',
          invoice_pdf: 'https://pay.stripe.com/invoice/abc/pdf',
        },
      ],
    } as never)

    const result = await getInvoices('cus_abc')

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      id: 'in_123',
      createdAt: 1700000000,
      amountDue: 1900,
      currency: 'usd',
      status: 'paid',
      pdfUrl: 'https://pay.stripe.com/invoice/abc/pdf',
    })
  })

  it('returns empty array when Stripe returns no invoices', async () => {
    mockList.mockResolvedValue({ data: [] } as never)

    const result = await getInvoices('cus_abc')

    expect(result).toEqual([])
  })

  it('throws "stripeCustomerId is required" when given empty string', async () => {
    await expect(getInvoices('')).rejects.toThrow('stripeCustomerId is required')
  })

  it('throws "Failed to fetch invoices" when Stripe API errors', async () => {
    mockList.mockRejectedValue(new Error('Stripe network error'))

    await expect(getInvoices('cus_abc')).rejects.toThrow('Failed to fetch invoices')
  })

  it('passes limit: 100 to Stripe', async () => {
    mockList.mockResolvedValue({ data: [] } as never)

    await getInvoices('cus_abc')

    expect(mockList).toHaveBeenCalledWith({
      customer: 'cus_abc',
      limit: 100,
    })
  })
})
