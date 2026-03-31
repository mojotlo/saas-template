import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Integration tests — requires Docker Postgres to be running
    // Run: docker compose up -d before executing these tests
    include: ['tests/integration/**/*.test.ts'],
    // Points to the Docker Postgres instance from docker-compose.yml
    env: {
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/test',
      DIRECT_DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/test',
    },
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
