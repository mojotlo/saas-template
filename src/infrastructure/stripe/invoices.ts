// Infrastructure: Stripe Invoices
//
// Fetches invoice data from the Stripe API.
// No business logic — raw data retrieval only.

import { stripe } from './client'
import type { RawInvoiceData } from '../../domain/invoice/invoice'

export async function getInvoices(stripeCustomerId: string): Promise<RawInvoiceData[]> {
  if (!stripeCustomerId) {
    throw new Error('stripeCustomerId is required')
  }

  try {
    const response = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 100,
    })

    return response.data.map((invoice) => ({
      id: invoice.id,
      createdAt: invoice.created,
      amountDue: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status ?? '',
      pdfUrl: invoice.invoice_pdf ?? null,
    }))
  } catch (error) {
    console.error('Failed to fetch invoices from Stripe:', error)
    throw new Error('Failed to fetch invoices')
  }
}
