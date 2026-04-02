// Domain: Invoice
//
// Pure mapping from raw invoice data to domain types.
// No side effects, no external API calls, no Stripe knowledge.

import { createMoney, type Currency, type Money } from '../money/money'

export type InvoiceStatus = 'paid' | 'open' | 'draft' | 'void' | 'uncollectible'

export type InvoiceRow = {
  id: string
  date: string
  amount: Money
  status: InvoiceStatus
  pdfUrl: string | null
}

export type RawInvoiceData = {
  id: string
  createdAt: number
  amountDue: number
  currency: string
  status: string
  pdfUrl: string | null
}

const VALID_CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'CAD']
const VALID_STATUSES: InvoiceStatus[] = ['paid', 'open', 'draft', 'void', 'uncollectible']

function toSupportedCurrency(currency: string): Currency {
  const upper = currency.toUpperCase()
  if (VALID_CURRENCIES.includes(upper as Currency)) return upper as Currency
  throw new Error(`Unsupported currency: ${currency}`)
}

function toInvoiceStatus(status: string): InvoiceStatus {
  if (VALID_STATUSES.includes(status as InvoiceStatus)) return status as InvoiceStatus
  throw new Error(`Unknown invoice status: ${status}`)
}

export function mapInvoice(raw: RawInvoiceData): InvoiceRow {
  return {
    id: raw.id,
    date: new Date(raw.createdAt * 1000).toLocaleDateString(),
    amount: createMoney(raw.amountDue, toSupportedCurrency(raw.currency)),
    status: toInvoiceStatus(raw.status),
    pdfUrl: raw.pdfUrl,
  }
}
