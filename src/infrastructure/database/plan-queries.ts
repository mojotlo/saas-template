import { prisma } from '@/infrastructure/database/client'

export function getAllPlans() {
  return prisma.plan.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      stripePriceIdMonthly: true,
      stripePriceIdAnnual: true,
      amountMonthly: true,
      amountAnnual: true,
      currency: true,
      features: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: 'asc' },
  })
}

export function getPlanById(id: string) {
  return prisma.plan.findUnique({
    where: { id },
    include: {
      _count: { select: { subscriptions: true } },
    },
  })
}

export type CreatePlanData = {
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

export function createPlan(data: CreatePlanData) {
  return prisma.plan.create({ data })
}

export function updatePlan(id: string, data: CreatePlanData) {
  return prisma.plan.update({ where: { id }, data })
}

export function deletePlan(id: string) {
  return prisma.plan.delete({ where: { id } })
}

export function findPlanByStripePriceId(priceId: string) {
  return prisma.plan.findFirst({
    where: {
      OR: [
        { stripePriceIdMonthly: priceId },
        { stripePriceIdAnnual: priceId },
      ],
    },
    select: { id: true, name: true },
  })
}
