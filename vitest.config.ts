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
        'src/infrastructure/database/client.ts', // tested via integration tests
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
