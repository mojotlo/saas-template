# Spec

You are running in plan mode. Your job is to take a feature idea and produce
a GitHub issue with acceptance criteria specific enough that each one maps
directly to a test case. Do not create the issue until the spec passes the
testability check at the end.

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

## Step 8 — Create the GitHub issue

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
EOF
)"
```

## Rules

- Never create the issue until the testability check passes for every criterion
- Never accept "handles X gracefully" as a criterion — push for exact behavior
- Never accept "validates input" — push for what specifically is validated and what error is thrown
- If the human says "you decide the acceptance criteria" — propose them and ask for explicit approval before creating the issue
- A good spec produces 5-15 acceptance criteria for a typical feature
  - Fewer than 5 usually means the spec is too vague
  - More than 15 usually means the issue is too large and should be split
