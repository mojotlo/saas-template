import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { updatePlan, removePlan, PlanServiceError } from '@/services/admin/planService'
import { parsePlanInput } from '../route'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser()

  if (!user || user.publicMetadata.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const plan = await updatePlan(id, parsePlanInput(body))
    return NextResponse.json({ plan })
  } catch (err) {
    if (err instanceof PlanServiceError) {
      return NextResponse.json(
        { error: err.message, errors: err.errors },
        { status: err.statusCode }
      )
    }
    const message =
      err instanceof Error ? err.message : 'Failed to update plan'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser()

  if (!user || user.publicMetadata.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    await removePlan(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof PlanServiceError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode }
      )
    }
    const message =
      err instanceof Error ? err.message : 'Failed to delete plan'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
