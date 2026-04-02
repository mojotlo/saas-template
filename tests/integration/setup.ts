import { prisma } from '../../src/infrastructure/database/client'

// Runs before each integration test file.
// Cleans the database between test runs to prevent state bleed.
//
// Add deleteMany() calls here in reverse dependency order as you add models.
// Example:
//   await prisma.post.deleteMany()
//   await prisma.user.deleteMany()

beforeEach(async () => {
  // Children before parents — delete in reverse dependency order
  await prisma.webhookEvent.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.user.deleteMany()
  await prisma.plan.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})
