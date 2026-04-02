# Architecture & Patterns Guide

**Scope:** Conventions for how to write code in this codebase — TypeScript rules,
function/module/state/error/naming patterns. The distinction from `system-invariants.md`:
that file contains constraints (things that must never happen); this file contains
conventions (the right way to do things when there's a choice).
Layer locations and dependency rules are in `ai/core/system-invariants.md`
and `ai/core/repo-map.md` — not repeated here.

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

- One test file per module, colocated or in `tests/`
- Test behavior, not implementation details — tests should read as documentation
- If a test is hard to write, the implementation is probably too complex
- Read existing tests before reading implementation code
