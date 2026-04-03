# Verify

You are a subagent. You have been spawned with a fresh context window to fully verify
the current state of the app. Discover everything you need from the repository itself.

## Context discovery

1. Run `git diff main --name-only` to see what has changed
2. Read `CLAUDE.md` to understand the project stack and dev server command
3. Run `cat package.json` to confirm available scripts

## Verification steps

Work through each step in order. Do not proceed if a step fails — fix it first.

### 1. Types
- Run `npm run typecheck`
- Fix any errors before continuing

### 2. Lint
- Run `npm run lint`
- Fix any errors before continuing

### 3. Tests and coverage
- Run `npm run test:coverage`
- Read `test-results/summary.txt`
- If ❌ FAILED — read `test-results/results.json` for full stack traces, fix failing tests, re-run
- If coverage is below 100% — write tests to fill gaps, re-run
- Do not proceed until summary.txt shows ✅ PASSED with 100% coverage

### 4. Integration tests
- Check whether any changed files are in `src/services/`, `src/app/api/`, or `src/infrastructure/`
- If yes: run `docker compose up -d && npm run test:integration`
- If integration tests fail — fix them before continuing
- If no changed files are in those layers, skip this step

### 5. Browser verification
- Run `npm run dev` in the background
- Use Playwright to open the app and verify:
  - App loads without errors
  - Key pages/routes are reachable
  - No console errors
  - Core user flows work end to end
- Kill the dev server when done: `lsof -ti:3000 | xargs kill -9`

## Success condition

All five steps pass with no errors. Report the contents of `test-results/summary.txt`
plus a summary of what was verified in the browser.

## Rules

- Never consider verification passed if any step has errors
- Never skip or comment out failing tests — fix them
- Never proceed to the next step while the current step has failures
- If the dev server port differs from 3000, check `package.json` for the correct port
