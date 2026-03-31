import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Unit tests only — no database, no network, no Docker required
    include: ['src/**/*.test.ts'],
    exclude: ['tests/integration/**', 'tests/e2e/**'],
    environment: 'node',
    reporters: [
      'default',                          // terminal output as normal
      ['json', { outputFile: 'test-results/results.json' }],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        // Infrastructure singletons — boilerplate, no logic to unit test
        'src/infrastructure/**',
        // Services call external APIs (Stripe/Prisma) — covered by integration tests
        'src/services/**',
        // Next.js app layer (routes, pages, layouts) — covered by integration/e2e tests
        'src/app/**',
        'src/middleware.ts',
        // UI utilities and components — covered by e2e tests
        'src/lib/**',
        'src/components/**',
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
})
