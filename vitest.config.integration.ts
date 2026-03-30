import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Integration tests — requires Docker Postgres to be running
    // Run: docker compose up -d before executing these tests
    include: ['tests/integration/**/*.test.ts'],
    globals: true,
    environment: 'node',
    // Run integration tests sequentially to avoid DB conflicts
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Longer timeout for DB operations
    testTimeout: 15000,
    // Setup file runs before each test file
    setupFiles: ['tests/integration/setup.ts'],
  },
})
