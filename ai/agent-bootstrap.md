# Agent Bootstrap

You are working in an AI-assisted TypeScript/Node.js repository.

Before touching any code, read the context files in CLAUDE.md in order.
This file defines your working process once you have that context.

---

## Task Workflow

When given a task, follow these steps exactly:

1. **Identify the relevant module** using `repo-map.md`
2. **Read related tests** before reading implementation code
3. **Plan the smallest change** that satisfies the task
4. **State your plan** before writing any code — confirm if uncertain
5. **Implement the change**
6. **Run tests** — all must pass
7. **Summarize** what changed and why

Do not skip steps. Do not jump straight to implementation.

---

## Planning

Use Plan mode (Shift+Tab twice in Claude Code) before implementing.

**Starting a new feature from scratch:**
Run `/spec` to produce a properly structured GitHub issue before any implementation.
Do not start a code session without a spec that has passed the testability check.

**Implementing an existing issue:**
1. Run `gh issue view <N>` to read the full spec
2. Check the Dependencies section — if blocked by another issue, stop and report
3. Use the acceptance criteria as the definition of done
   — each criterion must map to a test case
4. Reference the issue number in the PR body as "Closes #<N>"

A good plan:
- names the specific files to be changed
- describes what will change in each file
- identifies which tests cover the affected behavior
- maps each acceptance criterion to a specific test case
- flags any risk or uncertainty

A good plan enables 1-shot implementation. Invest in it.

---

## TDD Workflow

Tests must come from the spec, not from the implementation.
The goal is tests that verify behavior defined in the issue, not tests that
describe what was built.

**Red — translate acceptance criteria into tests:**
1. Read the acceptance criteria from the GitHub issue
2. For each criterion, write a test that asserts it is met
   - Map criterion → test case directly, one to one
   - If a criterion can't be expressed as a test, the criterion is too vague
     — stop and clarify the issue spec before proceeding
3. Run `npm test` — new tests must FAIL
   - If they pass before any implementation, the test is wrong — fix it
4. Commit: `git commit -m "test: add failing tests for <feature>"`

**Green — implement until tests pass:**
1. Write the minimum code to make failing tests pass
2. Run `npm test` after each meaningful change
3. Do not write code that isn't required by a test

**Refactor — clean up:**
1. Run `/simplify` — only after all tests are green
2. Tests must stay green throughout

### Test modification rules

Once a test is committed, it is frozen. You may:
- Add new tests
- Add new `describe` blocks

You may NOT without explicit human approval:
- Modify existing test assertions
- Delete existing tests
- Add `.skip` or `.todo` to existing tests
- Weaken assertions (e.g. `toBe(x)` → `toBeDefined()`)

If you believe an existing test is incorrect, stop and explain why.
Do not change it. Wait for human confirmation before proceeding.

### What to do when acceptance criteria are too vague

If an issue says "add user registration" with no specific criteria,
you cannot write meaningful tests from it. Stop, and either:
- Ask the human to clarify the acceptance criteria
- Propose specific criteria and ask for approval before writing any tests

Never invent acceptance criteria on your own. They define what the
software is supposed to do — that's a human decision.

---

## Scope Discipline

Before starting, check `allowed-changes.md`.

If the task requires work outside allowed scope:
1. Stop
2. Explain what would be needed and why it's out of scope
3. Request clarification before proceeding

Do not interpret tasks broadly. Do not do unrequested work.

---

## Verification

After every meaningful code change — not just at end of session:

1. Run `npm test` — this runs tests AND writes `test-results/summary.txt`
2. Read `test-results/summary.txt` — understand exactly what passed, failed, or has coverage gaps
3. Fix any failures before moving to the next change
4. Run `npm run lint` and `npm run typecheck` before committing

If tests fail:
- Read the full error in `test-results/results.json` for stack traces
- Fix the code or the test — never skip or comment out failing tests
- Re-run until summary.txt shows ✅ PASSED

Claude should never consider a task done until `test-results/summary.txt` shows all passing and 100% coverage.

---

## Architecture Decisions

If a task involves introducing a new library, framework, tool, or architectural
pattern not already in the codebase:

1. **Stop before implementing** — check `ai/decisions/` for an existing ADR
2. **If no ADR exists** — create one before writing any code
3. **If an ADR exists but the decision has changed** — update it before implementing
4. **After implementing** — update the ADR index in `ai/decisions/README.md`

Do not introduce new dependencies or architectural patterns without a documented decision.
This is not optional — undocumented decisions are not allowed changes.

---

## Subagent Invocation

The following slash commands are subagents — they run in a fresh context window
and should be invoked automatically at the right points in the workflow, not just
when the human asks. Each is self-contained and discovers its own context from
the repository.

Invoke subagents in this order after completing an implementation:

```
Implementation complete + tests passing
  → invoke /simplify
    → if simplify reports changes: re-run tests to confirm still passing
  → invoke /verify
    → if verify reports failures: fix them, then re-run /verify
  → invoke /code-review
    → if code-review reports Must Fix items: fix them, then re-run /code-review
  → invoke /commit-push-pr
    → subagent owns CI monitoring until green
  → invoke /wrap-session (for significant feature builds only)
    → human approves any proposed CLAUDE.md updates before they are applied
```

Do not invoke a later subagent until the earlier one has reported success.
Do not skip subagents — each one catches a different class of problems.
If a subagent fails after 3 attempts to fix the issue, stop and ask for human input.

/wrap-session is optional — skip it for small fixes, docs updates, and dependency bumps.
Invoke it whenever something went wrong, a retry was needed, or an architecture decision was made.

---

## When to Bail

Some sessions should be abandoned rather than continued. Run `/bail` when:

- Tests have failed more than 3 times on the same issue
- The approach turned out to be fundamentally wrong
- The scope has expanded beyond the original issue
- An architecture violation was discovered that requires rethinking the approach
- Context window is above 80% and quality is visibly degrading
- Claude is making changes to files outside the original plan

Do not try to recover a session that should be bailed. Bail fast, capture the
learning, and start fresh with a better plan.

**Bail vs catchup:**
- `/catchup` — session is paused but healthy, continue where you left off
- `/bail` — session is going sideways, abandon and capture the learning

---

## Resuming an Interrupted Session

If you are starting a session in a worktree that already has commits or changes
from a previous session, run `/catchup` before doing anything else.

The pattern is:
1. `/clear` — clears the context window to free up tokens
2. `/catchup` — re-orients to the current state of the branch
3. Continue from where the previous session left off

---

## Style

- Small, focused commits
- One logical change per session where possible
- Do not refactor unrelated code while implementing a feature
- Prefer obvious code over clever code
