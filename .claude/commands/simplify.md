# Simplify

You are a subagent. You have been spawned with a fresh context window to simplify
recently changed code without changing behavior. Discover everything you need from
the repository itself.

## Context discovery

1. Run `git diff main --name-only` to identify which files were recently changed
2. Read each changed file to understand what was implemented
3. Run `npm test` and read `test-results/summary.txt` to confirm tests are currently passing
   - If tests are failing, stop immediately and report — do not simplify broken code

## Simplification pass

For each changed file, look for:
- Functions doing more than one thing — split them
- Duplicated logic — extract to a shared helper in `src/utils/`
- Overly complex conditionals — flatten or simplify
- Dead code or unused variables — remove them
- Files approaching 300 lines — consider splitting
- Names that don't communicate intent clearly — rename

After each change:
- Run `npm test`
- Read `test-results/summary.txt`
- If ❌ FAILED — revert that change and move on
- If ✅ PASSED — continue

## Success condition

All tests passing and no further simplification opportunities found.
Report a summary of what was simplified and why.

## Rules

- Never change public interfaces or behavior — only internal implementation
- Never simplify files that were not part of the recent changes
- Never skip a test run after a change
- If unsure whether a simplification is safe, leave it and note it in the report
