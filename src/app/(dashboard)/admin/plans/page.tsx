import { getAllPlans } from '@/infrastructure/database/plan-queries'
import { PlanTable } from './plan-table'

export default async function PlansPage() {
  const plans = await getAllPlans()

  return (
    <div className="space-y-6">
      <PlanTable plans={plans} />
    </div>
  )
}
