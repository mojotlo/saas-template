import { describe, it, expect } from 'vitest'
import { mapInvoice, type RawInvoiceData } from './invoice'
import { formatMoney } from '../money/money'

function makeRawInvoice(overrides: Partial<RawInvoiceData> = {}): RawInvoiceData {
  return {
    id: 'in_123',
    createdAt: 1700000000,
    amountDue: 1900,
    currency: 'usd',
    status: 'paid',
    pdfUrl: 'https://pay.stripe.com/invoice/abc/pdf',
    ...overrides,
  }
}

describe('mapInvoice', () => {
  it('maps raw invoice to InvoiceRow with correct fields', () => {
    const raw = makeRawInvoice()
    const row = mapInvoice(raw)

    expect(row.id).toBe('in_123')
    expect(row.date).toBe(new Date(1700000000 * 1000).toLocaleDateString())
    expect(row.amount).toEqual({ amount: 1900, currency: 'USD' })
    expect(row.status).toBe('paid')
    expect(row.pdfUrl).toBe('https://pay.stripe.com/invoice/abc/pdf')
  })

  it('sets pdfUrl to null when not available', () => {
    const raw = makeRawInvoice({ pdfUrl: null })
    const row = mapInvoice(raw)

    expect(row.pdfUrl).toBeNull()
  })

  it('formats zero-amount invoices as $0.00 using Money module', () => {
    const raw = makeRawInvoice({ amountDue: 0 })
    const row = mapInvoice(raw)

    expect(row.amount).toEqual({ amount: 0, currency: 'USD' })
    expect(formatMoney(row.amount)).toBe('$0.00')
  })

  it('maps all valid invoice statuses', () => {
    const statuses = ['paid', 'open', 'draft', 'void', 'uncollectible'] as const
    for (const status of statuses) {
      const raw = makeRawInvoice({ status })
      const row = mapInvoice(raw)
      expect(row.status).toBe(status)
    }
  })

  it('throws on unknown status', () => {
    const raw = makeRawInvoice({ status: 'refunded' })
    expect(() => mapInvoice(raw)).toThrow('Unknown invoice status: refunded')
  })

  it('handles EUR currency', () => {
    const raw = makeRawInvoice({ currency: 'eur', amountDue: 2050 })
    const row = mapInvoice(raw)

    expect(row.amount).toEqual({ amount: 2050, currency: 'EUR' })
    expect(formatMoney(row.amount)).toBe('€20.50')
  })

  it('throws on unsupported currency', () => {
    const raw = makeRawInvoice({ currency: 'jpy' })
    expect(() => mapInvoice(raw)).toThrow('Unsupported currency: jpy')
  })
})
