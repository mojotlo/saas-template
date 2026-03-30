# Allowed Changes

AI agents working in this repository must stay within the following scope.

If a requested change requires work outside these rules, stop and request clarification.

---

## Allowed

The agent may:

- implement small, well-scoped features
- fix bugs
- add or update tests
- update documentation and comments
- refactor small sections of code within a single module
- improve error handling
- improve naming or readability
- split a file that has exceeded the size limit (300–500 lines)
- create or update ADRs in `ai/decisions/` when introducing new patterns

All changes must follow the workflow defined in `agent-bootstrap.md`
and the rules in `CLAUDE.md`.

---

## Conditionally Allowed

The agent may perform the following **only if directly necessary** to complete the task:

- modify multiple files within the same module
- extract small helper functions into `utils/`
- add a new file within an existing module
- update TypeScript types or interfaces that are tightly coupled to the change

Changes must remain minimal and localized. Explain why cross-file changes are necessary.

---

## Not Allowed

The agent must **NOT** do any of the following without explicit instruction:

- add, remove, or upgrade npm dependencies (`package.json`, lock files)
- introduce new frameworks, libraries, or tools without a corresponding ADR in `ai/decisions/`
- change the overall architecture or layer boundaries
- perform large refactors spanning multiple modules
- reorganize the directory structure
- modify unrelated modules
- delete large sections of code
- change database schemas or migrations
- modify deployment configuration (Dockerfiles, CI/CD, env files)
- modify `.env` files or any file containing secrets
- change `tsconfig.json` compiler options

These require explicit human instruction.

---

## Escalation Rule

If the task requires work outside the allowed scope:

1. **Stop** — do not proceed
2. **Explain** the limitation clearly: what would be needed and why it's out of scope
3. **Request clarification** before doing anything

Do not interpret the task broadly to justify out-of-scope work.
Do not proceed and explain afterward.

---

## Project-Specific Overrides

> Fill this section in when cloning the template.
> Use it to add project-specific restrictions or permissions.

Examples:
- "Do not modify the `src/infrastructure/payments/` module — it is frozen pending security review"
- "The `src/domain/pricing/` module may be freely refactored"
- "Always run `npm run db:validate` after any schema-adjacent change"

| Rule | Reason |
|---|---|
| [add project-specific rules here] | |
