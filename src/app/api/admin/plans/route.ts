import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createPlan, PlanServiceError } from '@/services/admin/planService'
import type { PlanInput } from '@/domain/plan/plan'

function parsePlanInput(body: Record<string, unknown>): PlanInput {
  return {
    name: (body.name as string) ?? '',
    description: (body.description as string) ?? '',
    stripePriceIdMonthly: (body.stripePriceIdMonthly as string) ?? '',
    stripePriceIdAnnual: (body.stripePriceIdAnnual as string) ?? '',
    features: (body.features as string) ?? '',
    sortOrder: (body.sortOrder as number) ?? 0,
  }
}

export { parsePlanInput }

export async function POST(req: Request) {
  const user = await currentUser()

  if (!user || user.publicMetadata.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const plan = await createPlan(parsePlanInput(body))
    return NextResponse.json({ plan }, { status: 201 })
  } catch (err) {
    if (err instanceof PlanServiceError) {
      return NextResponse.json(
        { error: err.message, errors: err.errors },
        { status: err.statusCode }
      )
    }
    const message =
      err instanceof Error ? err.message : 'Failed to create plan'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
