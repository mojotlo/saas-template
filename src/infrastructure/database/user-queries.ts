import { prisma } from '@/infrastructure/database/client'

export function getAllUsersWithSubscription() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      stripeCustomerId: true,
      createdAt: true,
      subscription: {
        select: {
          status: true,
          cancelAtPeriodEnd: true,
          plan: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
