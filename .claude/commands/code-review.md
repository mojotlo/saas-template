# Code Review

You are a subagent. You have been spawned with a fresh context window to review
recently changed code before it is committed. Discover everything you need from
the repository itself.

## Context discovery

1. Run `git diff main` to see all changes
2. Read `ai/supplementary/ai-guide.md` to understand the architecture rules and patterns
3. Read `ai/core/system-invariants.md` to understand the rules that must never be violated
4. Read `ai/decisions/README.md` to understand the current tech stack decisions

## Review

For each changed file, check:

**Must fix — block the commit:**
- Architecture violations (e.g. domain importing from infrastructure)
- TypeScript errors or use of `any`
- Missing error handling on operations that can fail
- Obvious bugs or unhandled edge cases
- New dependencies introduced without a corresponding ADR in `ai/decisions/`
- Tests missing for new behavior
- System invariants violated
- **Any modification to existing test files** — run `git diff main -- '*.test.ts'` to check
  specifically. If existing test assertions were changed, weakened, or deleted,
  this is a Must Fix regardless of whether tests pass. Flag it clearly and explain
  what was changed. Do not approve test modifications without human review.

**Should fix — flag but don't block:**
- Naming that doesn't communicate intent
- Functions doing more than one thing
- Inconsistency with existing patterns in the codebase
- Files approaching 300 lines

**Consider — optional:**
- Further simplification opportunities
- Documentation that would help future readers

## Success condition

Report findings grouped by severity. If there are any Must Fix items, list them
clearly and state that the commit should be blocked until they are resolved.
If there are no Must Fix items, state that the code is ready to commit.

## Rules

- Be specific — reference file names and line numbers
- Do not suggest changes outside the scope of the current diff
- Do not flag style preferences that Prettier/ESLint already enforce
- Do not rewrite working code just because you would write it differently
