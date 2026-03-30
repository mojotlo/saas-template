# E2e Tests

Browser-based end-to-end tests using Playwright.

## Running

```bash
npm run test:e2e
```

## Rules

- Test real user flows, not implementation details
- Each test should be independent — no shared state between tests
- Use `data-testid` attributes for selectors, not CSS classes or text
- Keep tests focused — one flow per test file

## Structure

```
tests/e2e/
├── auth.test.ts       # sign up, sign in, sign out
├── [feature].test.ts  # one file per major feature flow
└── README.md          # this file
```

## Playwright config

Playwright is configured in `playwright.config.ts` at the project root.
The dev server must be running before e2e tests execute.
