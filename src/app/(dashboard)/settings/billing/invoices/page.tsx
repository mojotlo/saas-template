import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/infrastructure/database/client'
import { getInvoices } from '@/infrastructure/stripe/invoices'
import { mapInvoice, type InvoiceRow, type InvoiceStatus } from '@/domain/invoice/invoice'
import { formatMoney } from '@/domain/money/money'

const statusVariant: Record<InvoiceStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  paid: 'default',
  open: 'secondary',
  draft: 'outline',
  void: 'destructive',
  uncollectible: 'destructive',
}

function InvoiceTable({ invoices }: { invoices: InvoiceRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-3 pr-4 font-medium">Date</th>
            <th className="pb-3 pr-4 font-medium">Amount</th>
            <th className="pb-3 pr-4 font-medium">Status</th>
            <th className="pb-3 font-medium">PDF</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b last:border-0">
              <td className="py-3 pr-4">{invoice.date}</td>
              <td className="py-3 pr-4">{formatMoney(invoice.amount)}</td>
              <td className="py-3 pr-4">
                <Badge variant={statusVariant[invoice.status]}>
                  {invoice.status}
                </Badge>
              </td>
              <td className="py-3">
                {invoice.pdfUrl ? (
                  <a
                    href={invoice.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function InvoicesPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  })

  if (!dbUser?.stripeCustomerId) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No billing history yet
          </CardContent>
        </Card>
      </div>
    )
  }

  const rawInvoices = await getInvoices(dbUser.stripeCustomerId)
  const invoices = rawInvoices.map(mapInvoice)

  if (invoices.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No invoices found
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader />
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Your recent billing history.</CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceTable invoices={invoices} />
        </CardContent>
      </Card>
    </div>
  )
}

function PageHeader() {
  return (
    <div>
      <Link
        href="/dashboard/settings/billing"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Billing
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Invoice History</h1>
      <p className="mt-1 text-muted-foreground">View and download your past invoices.</p>
    </div>
  )
}
