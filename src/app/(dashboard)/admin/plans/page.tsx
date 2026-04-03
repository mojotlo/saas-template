import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllPlans } from '@/infrastructure/database/plan-queries'
import { createMoney, formatMoney, type Currency } from '@/domain/money/money'

export default async function PlansPage() {
  const plans = await getAllPlans()

  if (plans.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No plans yet. Create your first plan.
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
          <CardTitle>All Plans</CardTitle>
          <CardDescription>
            {plans.length} {plans.length === 1 ? 'plan' : 'plans'} configured.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">Monthly Price</th>
                  <th className="pb-3 pr-4 font-medium">Annual Price</th>
                  <th className="pb-3 pr-4 font-medium">Currency</th>
                  <th className="pb-3 font-medium">Sort Order</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{plan.name}</td>
                    <td className="py-3 pr-4">
                      {formatMoney(createMoney(plan.amountMonthly, plan.currency as Currency))}
                    </td>
                    <td className="py-3 pr-4">
                      {formatMoney(createMoney(plan.amountAnnual, plan.currency as Currency))}
                    </td>
                    <td className="py-3 pr-4">{plan.currency}</td>
                    <td className="py-3">{plan.sortOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Plans</h1>
      <p className="mt-1 text-muted-foreground">Manage subscription plans.</p>
    </div>
  )
}
