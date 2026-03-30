# ADR-004: Testing — Vitest + Playwright

**Status:** Accepted
**Date:** 2026-03-25
**Revisit when:** Framework switch introduces incompatibilities, or Vitest has major breaking changes

---

## Decision

Use Vitest for unit and integration tests, Playwright for end-to-end browser tests.

---

## Why — Vitest

- **TypeScript-native** — no `ts-jest` or Babel config needed; works with strict mode out of the box
- **Fast** — parallel execution by default, significantly faster than Jest for large test suites
- **Jest-compatible API** — `describe`, `it`, `expect`, `vi.mock` — muscle memory transfers
- **Modern** — native ES modules, no legacy config baggage
- **Coverage built-in** — `@vitest/coverage-v8` requires no separate setup

## Why — Playwright

- **Already in `.mcp.json`** — Claude Code uses it for browser verification during `/verify`
- **Best-in-class e2e** — auto-waiting, reliable selectors, multi-browser support
- **Same tool, two uses** — Claude uses it for verification, you use it for e2e test suite

---

## Alternatives considered

| Option | Reason not chosen |
|---|---|
| **Jest** | Slower, TypeScript config friction (`ts-jest`), ES module issues; Vitest is the modern replacement |
| **Cypress** | Good e2e tool but Playwright has overtaken it in reliability and speed; redundant given Playwright MCP |
| **Testing Library only** | Component testing only, not a full unit/integration solution |

---

## Test strategy by layer

```
Domain layer       →  Unit tests (Vitest, no DB, pure functions)
Services layer     →  Unit tests with mocked infrastructure (Vitest + vi.mock)
Infrastructure     →  Integration tests with real DB (Vitest + Docker Postgres)
API endpoints      →  API tests (Vitest + supertest)
Full user flows    →  E2e tests (Playwright)
```

## Coverage target

- Domain: 100% — pure functions, no excuse for gaps
- Services: 100% — mock infrastructure, test all branches
- Infrastructure: 80%+ — integration tests cover happy path and key error cases
- E2e: key user flows only — not counted in unit coverage metrics

---

## Upgrade triggers

- Project uses Next.js → add `@vitejs/plugin-react` or switch to Jest if Next.js tooling conflicts
- Project uses a framework with its own test runner (e.g. Remix) → evaluate framework-native testing
- Coverage tooling becomes insufficient → evaluate Istanbul alternatives
