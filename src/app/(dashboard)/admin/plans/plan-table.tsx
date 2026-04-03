'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createMoney, formatMoney, type Currency } from '@/domain/money/money'
import { PlanFormDialog } from './plan-form-dialog'
import { DeletePlanDialog } from './delete-plan-dialog'

export type PlanData = {
  id: string
  name: string
  description: string
  stripePriceIdMonthly: string
  stripePriceIdAnnual: string
  amountMonthly: number
  amountAnnual: number
  currency: string
  features: string[]
  sortOrder: number
}

type PlanTableProps = {
  plans: PlanData[]
}

export function PlanTable({ plans }: PlanTableProps) {
  const router = useRouter()

  const [createOpen, setCreateOpen] = useState(false)
  const [editPlan, setEditPlan] = useState<PlanData | null>(null)
  const [deletePlan, setDeletePlan] = useState<PlanData | null>(null)

  function handleSuccess() {
    router.refresh()
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plans</h1>
          <p className="mt-1 text-muted-foreground">
            Manage subscription plans.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Create Plan</Button>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-lg border py-8 text-center text-muted-foreground">
          No plans yet. Create your first plan.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Monthly Price</th>
                <th className="px-4 py-3 font-medium">Annual Price</th>
                <th className="px-4 py-3 font-medium">Currency</th>
                <th className="px-4 py-3 font-medium">Sort Order</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{plan.name}</td>
                  <td className="px-4 py-3">
                    {formatMoney(
                      createMoney(
                        plan.amountMonthly,
                        plan.currency as Currency
                      )
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {formatMoney(
                      createMoney(
                        plan.amountAnnual,
                        plan.currency as Currency
                      )
                    )}
                  </td>
                  <td className="px-4 py-3">{plan.currency}</td>
                  <td className="px-4 py-3">{plan.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditPlan(plan)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit {plan.name}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletePlan(plan)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete {plan.name}</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PlanFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleSuccess}
      />

      {editPlan && (
        <PlanFormDialog
          mode="edit"
          plan={editPlan}
          open={!!editPlan}
          onOpenChange={(open) => {
            if (!open) setEditPlan(null)
          }}
          onSuccess={handleSuccess}
        />
      )}

      {deletePlan && (
        <DeletePlanDialog
          plan={deletePlan}
          open={!!deletePlan}
          onOpenChange={(open) => {
            if (!open) setDeletePlan(null)
          }}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
