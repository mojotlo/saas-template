import { prisma } from '@/infrastructure/database/client'

export function getAllPlans() {
  return prisma.plan.findMany({
    select: {
      id: true,
      name: true,
      amountMonthly: true,
      amountAnnual: true,
      currency: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: 'asc' },
  })
}
