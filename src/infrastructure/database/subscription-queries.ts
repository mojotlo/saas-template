import { prisma } from '@/infrastructure/database/client'

export function getAllSubscriptionsWithDetails() {
  return prisma.subscription.findMany({
    select: {
      stripeSubscriptionId: true,
      stripePriceId: true,
      status: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
      user: {
        select: { email: true },
      },
      plan: {
        select: {
          name: true,
          stripePriceIdMonthly: true,
          stripePriceIdAnnual: true,
          amountMonthly: true,
          amountAnnual: true,
          currency: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
