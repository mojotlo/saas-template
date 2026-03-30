import { prisma } from '../../src/infrastructure/database/client'

// Runs before each integration test file.
// Cleans the database between test runs to prevent state bleed.
//
// Add deleteMany() calls here in reverse dependency order as you add models.
// Example:
//   await prisma.post.deleteMany()
//   await prisma.user.deleteMany()

beforeEach(async () => {
  // Add cleanup here as you add models to schema.prisma
})

afterAll(async () => {
  await prisma.$disconnect()
})
