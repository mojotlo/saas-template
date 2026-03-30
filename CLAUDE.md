# CLAUDE.md

This is an AI-assisted JavaScript/TypeScript/Node.js project.

Read the following files before doing any work, in this order:

1. `ai/system-invariants.md` — rules that must never be violated
2. `ai/agent-bootstrap.md` — working process and task workflow
3. `ai/ai-guide.md` — architecture, layers, and dev strategy
4. `ai/repo-map.md` — where to find things in this repository
5. `ai/allowed-changes.md` — what you are and are not allowed to do

---

## Quick Reference

### Commands
```bash
npm run dev        # start development server
npm test           # run test suite
npm run build      # production build
npm run lint       # lint check
npm run typecheck  # TypeScript type check
```

### Database Commands
```bash
npx prisma migrate dev      # create and apply a migration (development)
npx prisma migrate deploy   # apply migrations (production/CI)
npx prisma generate         # regenerate Prisma client after schema changes
npx prisma studio           # open database GUI
npx prisma db push          # push schema changes without a migration (prototyping only)
```

> Update these commands to match this project's actual package.json scripts.

### Stack
- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js
- **Package manager:** [npm / pnpm / yarn — fill in]
- **Test framework:** [Jest / Vitest / etc — fill in]

### Key Rules (full details in ai/ files)
- Tests must pass after every change
- Never modify `node_modules/`, lock files, or deployment config without explicit instruction
- Keep files under 300 lines; 500 is the hard maximum
- Follow existing patterns — consistency over novelty
- When in doubt, stop and ask
- New libraries or architectural patterns require an ADR in `ai/decisions/` before implementation

---

## Session Workflow

Every feature or fix follows this loop. Do not skip steps.

```
/spec            → turn a feature idea into a testable GitHub issue (plan mode)
Plan mode        → review spec, confirm approach before writing any code
Code mode        → execute the spec; loop until all tests pass
/simplify        → clean up code without changing behavior (only on green tests)
/verify          → start dev server, open browser, confirm app works end to end
/code-review     → catch anything missed; flag must-fix issues before committing
/commit-push-pr  → commit, push branch, open PR with description
/wrap-session    → capture session learnings, propose CLAUDE.md updates
```

### Rules for this loop
- Each spec should be small enough to complete in one session — split if unsure
- Never run /simplify on failing tests
- /verify may surface issues that send you back to code mode — that is expected
- /code-review is a first pass, not a substitute for reading the diff yourself
- The PR is the final human gate — review before merging
- GitHub Actions will run CI automatically on the PR (lint, typecheck, tests, Claude review)

---

## Working with GitHub Issues

Features and bugs are tracked as GitHub Issues. Each issue is a self-contained spec
that Claude Code can execute in Plan mode.

**To implement a feature:**
1. Find the issue number on GitHub (e.g. #12)
2. In Claude Code Plan mode: "Implement issue #12"
3. Claude reads the issue, plans the change, you approve
4. The PR body should include "Closes #12" to auto-close the issue on merge

**Issue templates** live in `.github/ISSUE_TEMPLATE/`:
- `feature.md` — new features with acceptance criteria
- `bug.md` — bugs with reproduction steps

**Priority labels:** P0 (critical), P1 (important), P2 (nice to have)

---

## Project Brief

> Replace this section when cloning the template.
> Keep it short — 1-3 paragraphs. Claude reads this every session.
>
> Cover:
> - What this app does and who it's for
> - The core problem it solves
> - Any business rules or domain context Claude needs to understand
> - Areas that are frozen or sensitive
> - Anything Claude has done wrong before in this repo

---

## Project-Specific Notes

> Replace this section when cloning the template.
> Add anything Claude should know about this specific project:
> - non-obvious decisions that have already been made
> - third-party services in use (with links to their docs)
> - known gotchas or areas of complexity
