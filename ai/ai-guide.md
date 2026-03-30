# Architecture & Patterns Guide

This file describes the architecture of this project and the implementation
patterns to follow. Read this before writing any code.

---

## Architecture

This project uses a modular layered architecture.

### Layers

```
src/domain/           Core business logic — pure functions, no side effects
src/services/         Workflows and orchestration — composes domain logic
src/infrastructure/   External systems — APIs, databases, file system, queues
src/utils/            Reusable helpers — stateless, generic utilities
```

### Dependency Direction

```
infrastructure → services → domain
```

- `domain` has no dependencies on other layers
- `services` may use `domain` and `utils`
- `infrastructure` may use `services`, `domain`, and `utils`
- `utils` has no layer dependencies

If you find yourself importing infrastructure from domain, stop — that's an architecture violation.

---

## TypeScript Rules

- Strict mode is enabled — no `any`, no implicit `undefined`
- Prefer `type` over `interface` for data shapes
- Prefer `unknown` over `any` when type is genuinely uncertain
- Use explicit return types on public functions
- Avoid type assertions (`as X`) unless absolutely necessary and commented

---

## Implementation Patterns

### Functions

Prefer small, single-purpose functions with explicit inputs and outputs.

```ts
// ✅ Good
function calculateInvoiceTotal(lineItems: LineItem[]): Money { ... }

// ❌ Avoid
function processData(data: any): any { ... }
```

- Predictable control flow — avoid deeply nested conditionals
- One level of abstraction per function
- Name functions after what they do, not how they do it

### Modules

Each module should have one responsibility and a clear public interface.

```ts
// Export only what callers need
export { calculateInvoiceTotal, formatInvoice }
// Keep implementation details unexported
```

### State

Prefer explicit state through function parameters and return values.

```ts
// ✅ Good — state is explicit
function applyDiscount(cart: Cart, discount: Discount): Cart { ... }

// ❌ Avoid — hidden state
let currentDiscount: Discount  // module-level mutable state
```

No global mutable state in domain or service layers.

### Error Handling

Errors must be explicit and descriptive. No silent failures.

```ts
// ✅ Good — explicit, typed error
if (!user) throw new UserNotFoundError(`User ${userId} does not exist`)

// ❌ Avoid — silent failure
if (!user) return null  // caller won't know why
```

Consider using Result types for expected error cases in domain logic.

### Naming

Names must communicate intent clearly.

```ts
// ✅ Good
calculateInvoiceTotal()
validateUserPermissions()
formatDateForDisplay()

// ❌ Avoid
processData()
handleThing()
doWork()
```

Use full words. Abbreviations are only acceptable when the abbreviated form
is the standard (e.g. `generatePDF` not `genPDF`, `parseURL` not `parseU`).

Use folder, file, and function names together to embed semantic meaning —
`src/domain/billing/calculateInvoiceTotal.ts` communicates more than `src/utils/calc.ts`.

---

## Testing

Tests define correct behavior. Read them before reading implementation.

- One test file per module, colocated or in `tests/`
- Test behavior, not implementation details
- Tests should be readable as documentation
- If a test is hard to write, the code probably needs to be simpler

---

## Development Strategy

- Keep modules small and focused
- Isolate side effects at the infrastructure boundary
- Pure functions in domain logic wherever possible
- Orchestration belongs in services, not domain
- When uncertain: inspect tests, inspect nearby modules, follow existing patterns
