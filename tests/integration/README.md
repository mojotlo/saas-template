# Integration Tests

Tests that require a real database connection.

## Running

```bash
docker compose up -d    # start Postgres
npm run test:integration
docker compose down     # stop Postgres when done
```

## Rules

- Each test file gets a clean database via `setup.ts`
- Tests run sequentially (not in parallel) to avoid conflicts
- Always clean up after your test — don't rely on setup.ts alone
- Use a dedicated test database — never run against production

## Adding tables to cleanup

When you add a new model to `prisma/schema.prisma`, add a `deleteMany()`
call to `setup.ts` in reverse dependency order (children before parents).
