# Spec

You are running in plan mode. Your job is to take a feature idea and produce
a GitHub issue with acceptance criteria specific enough that each one maps
directly to a test case. Do not create the issue until the spec passes the
testability check at the end.

## Step 0 — Check existing planning work

Before asking the human to describe the feature:

1. Read `to-do.md` — check if this feature is already in the backlog
2. Check `ai/sessions/` for any planning notes matching this topic (files named `planning-*.md`)

If a planning note exists:
- Summarize what was already decided
- Tell the human which issues were already created from that planning session (if any)
- Ask whether to continue from the planning note or start fresh

If the feature is in `to-do.md` but has no planning note, note that and proceed.

## Step 1 — Understand the feature

Ask the human to describe the feature in one sentence if they haven't already.
Then restate it back in your own words to confirm understanding before proceeding.

## Step 2 — Behavior inventory

List every distinct behavior this feature needs to exhibit.
Frame each one as a function call or user action with concrete inputs and outputs.

For each behavior, answer:
- What is the exact input?
- What is the exact output or state change?
- What layer does this live in? (domain / service / infrastructure / UI)

Example:
```
registerUser(email: string, password: string) → User
- Input: valid email string, password string of 8+ characters
- Output: User object with id, email, createdAt, hashedPassword
- Layer: domain
```

Do not move to step 3 until every behavior is concrete enough to name its inputs and outputs.

## Step 3 — Error inventory

For each behavior from step 2, list every way it can fail.
For each failure, specify:
- What input or condition triggers it?
- What is thrown or returned?
- What does the error message say?

Example:
```
registerUser with invalid email → throws ValidationError("invalid email format")
registerUser with password < 8 chars → throws ValidationError("minimum 8 characters")
registerUser with duplicate email → throws DuplicateEmailError("email already exists")
```

Do not accept vague errors like "throws an error" or "returns null".
Push for the exact error type and message.

## Step 4 — Edge case inventory

For each behavior, identify boundary conditions:
- Zero / empty inputs
- Minimum and maximum values
- Concurrent calls (what happens if called twice simultaneously?)
- Missing optional fields
- Null or undefined inputs

Only include edge cases that are genuinely in scope for this issue.
Flag any that should be separate issues.

## Step 5 — Testability check

For each acceptance criterion, write the opening line of its test:

```typescript
it('should <criterion>', () => {
```

If you cannot write this line without making assumptions not stated in the criterion,
the criterion is too vague. Rewrite it until the test opening is unambiguous.

Example:
```
❌ "handles invalid email" — too vague, what does "handles" mean?
✅ "throws ValidationError with message 'invalid email format' when email has no @ symbol"
```

Do not proceed to step 6 until every criterion passes this check.

## Step 6 — Out of scope

List at least 3 things this issue explicitly does NOT include.
These are things a developer might reasonably assume are included but aren't.

Example for user registration:
- Does not send a welcome email (separate issue)
- Does not implement login (separate issue)
- Does not validate password strength beyond minimum length

## Step 7 — Dependency check

Ask: does this feature depend on any other issue being merged first?
Does any other planned issue depend on this one?

## Step 8 — Split check

Before creating the issue, ask: is this spec too large for one session?

Signs it should be split:
- More than 15 acceptance criteria
- Criteria span more than two distinct layers (e.g. domain + UI + infrastructure)
- The feature has a natural phase 1 / phase 2 separation

If a split is needed:
1. Propose how to split it (which criteria go in which issue, in what order)
2. Ask the human to approve the split
3. Write a planning note to `ai/sessions/planning-<topic>-<YYYY-MM-DD>.md` that captures:
   - The full original scope
   - How it was split and why
   - The planned issue sequence
   - Any cross-issue dependencies identified
4. Create the issues one at a time, starting with the most foundational
5. Note the planning note filename in the Technical Notes of each issue

If no split is needed, proceed directly to Step 9.

## Step 9 — Create the GitHub issue

Only now, create the issue using `gh issue create` with the feature template:

```bash
gh issue create \
  --title "<feature name>" \
  --label "feature" \
  --body "$(cat <<'EOF'
## What
<one sentence>

## Why
<why this needs to exist>

## Acceptance criteria
<each criterion from steps 2-4, formatted as checkboxes>
- [ ] <specific testable criterion>
- [ ] <specific testable criterion>

## Dependencies
- Blocked by: <issue number or "none">
- Must merge before: <issue number or "none">

## Out of scope
<from step 6>

## Technical notes
<layer locations, relevant ADRs, files likely to be affected>
<planning note: ai/sessions/planning-<topic>-<date>.md (if a split was done)>
EOF
)"
```

## Step 10 — Offer worktree creation

After the issue is created, ask:

```
Issue #N created. Ready to start a worktree for it?
(y) Run: bash scripts/new-worktree.sh <N>
(n) I'll set it up manually later
```

If the human says yes:
1. Run `bash scripts/new-worktree.sh <N>`
2. After the script completes, print:
   ```
   Worktree ready at ../saas-template-issue-<N>.
   Open that directory in Claude Code and run /load-context to begin.
   ```
3. Exit plan mode. Do not begin implementation in this session.

If the human says no, exit plan mode and summarize the issue number for reference.

## Rules

- Never create the issue until the testability check passes for every criterion
- Never accept "handles X gracefully" as a criterion — push for exact behavior
- Never accept "validates input" — push for what specifically is validated and what error is thrown
- If the human says "you decide the acceptance criteria" — propose them and ask for explicit approval before creating the issue
- A good spec produces 5-15 acceptance criteria for a typical feature
  - Fewer than 5 usually means the spec is too vague
  - More than 15 usually means the issue is too large and should be split (use Step 8)
