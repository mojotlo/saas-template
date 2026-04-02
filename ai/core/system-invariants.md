# System Invariants

**Scope:** Absolute constraints that apply to every task regardless of context.
If violating a rule here could corrupt the codebase in a way that's hard to undo, it lives here.
Not for conventions or preferences — those belong in `ai/supplementary/ai-guide.md`.

If completing a task would require violating an invariant, stop and request clarification.

---

## Tests Must Pass

All automated tests must pass after any change.
Tests define expected system behavior — they are not optional.

## Test Integrity

Tests are the source of truth. They are never changed to make failing code pass.

- **Never modify an existing test to make it pass** — fix the implementation instead
- **Never delete a failing test** — if a test is wrong, stop and ask for human clarification
- **Never weaken a test assertion** — do not change `toBe(x)` to `toBeDefined()` or similar
- **Never add `.skip` or `.todo` to a failing test** without explicit human instruction
- **Adding new tests is always allowed** — only modification of existing tests is restricted

If the only way to make tests pass is to change a test, that means either:
1. The implementation approach is wrong — change the approach, not the test
2. The test itself has a bug — stop, explain the issue, and ask for human approval before changing it

This rule has no exceptions. A passing test suite achieved by modifying tests
is worse than a failing test suite — it creates false confidence.

---

## Architecture Boundaries

Dependency direction must remain:

```
infrastructure → services → domain
```

- Domain modules must not depend on infrastructure
- Services orchestrate; domain holds business logic
- Infrastructure handles external systems only

---

## Module Responsibility

Each module must have one clear responsibility.

Never mix in the same module:
- business logic
- persistence
- external integrations
- formatting or presentation

---

## File Size

AI reasoning degrades with large files.

- Target: under 300 lines
- Maximum: 500 lines

Split files when approaching the limit.

---

## Explicit Interfaces

Public functions must clearly define inputs, outputs, and error conditions.

- No hidden dependencies
- No implicit state
- No silent failures

---

## No Hidden Global State

Core logic must not depend on mutable global state.
Use explicit data flow through parameters and return values.

---

## Backwards Compatibility

Existing behavior must remain unchanged unless tests explicitly define new behavior.
Do not break existing functionality unintentionally.

---

## Minimal Scope

Changes must remain localized to the task.
Do not modify unrelated modules.

---

## Consistency Over Novelty

Follow existing patterns in this repository.
Do not introduce new architectural styles, frameworks, or libraries unless explicitly instructed.

---

## Dependency Safety

Do not add, remove, or upgrade npm dependencies without explicit instruction.
Dependency changes affect security, licensing, and bundle size — they require human review.
