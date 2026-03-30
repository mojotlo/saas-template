# Bail

You are a subagent. The current session has gone sideways and is being abandoned.
Your job is to capture why it failed, what was learned, and what needs to change
before this is attempted again — then cleanly discard all changes.

Do this fast. The human wants to kill this session, not spend time on it.

## Step 1 — Capture what happened

Run these to understand the state before discarding anything:

```bash
git branch --show-current
git log main..HEAD --oneline
git diff main --stat
git status
cat test-results/summary.txt 2>/dev/null || echo "No test results"
```

## Step 2 — Ask one question

Ask the human:

> "In one sentence, why are we bailing? (e.g. wrong approach, scope too large,
> cascading test failures, architecture conflict, dependency issue)"

Wait for their answer.

## Step 3 — Write a bail log

Create `ai/sessions/YYYY-MM-DD-<branch>-BAILED.md`:

```markdown
# BAILED: <branch name>
Date: <today>
Issue: <issue number and title from gh issue view>
Reason: <human's one-sentence answer>

## What was attempted
<1-2 sentences from git log and diff — what did Claude actually try>

## What failed
<What specifically went wrong — test failures, wrong architecture,
scope explosion, dependency conflict, etc.>

## What needs to change before retrying
<Specific changes to the issue spec, CLAUDE.md, or approach.
Be concrete — vague notes won't help the next session.>

## Issue spec updates needed
<If the issue spec was incomplete or wrong, write the exact
changes needed to the GitHub issue before retrying.>
```

## Step 4 — Update the GitHub issue (if spec was wrong)

If the failure was due to an incomplete or incorrect issue spec, update it:

```bash
gh issue edit <N> --body "<updated spec>"
```

Or add a comment with the learnings:

```bash
gh issue comment <N> --body "Attempted implementation failed. See ai/sessions/...-BAILED.md for details. Spec needs: <what needs to change>"
```

## Step 5 — Propose CLAUDE.md updates

If the failure reveals something Claude should know for future sessions,
propose a specific addition to CLAUDE.md. One proposal maximum — if it
failed for multiple reasons, capture the most important one.

Present it as:
```
Proposed CLAUDE.md update:
Pattern: <what went wrong>
Addition: <exact text to add>
Section: <which section>

Approve? (yes / no)
```

Wait for approval before applying.

## Step 6 — Discard all changes

Once the bail log is written and any approved CLAUDE.md update is applied,
discard everything:

```bash
# Commit only the bail log and any CLAUDE.md update
git add ai/sessions/
git add CLAUDE.md 2>/dev/null
git stash drop 2>/dev/null || true
git checkout -- .              # discard all working changes
git clean -fd                  # remove untracked files

# Or if you want to keep nothing at all:
# git reset --hard main
```

Then from the main repo, the human can run:
```bash
npm run worktree:cleanup <issue-number>
```

## Step 7 — Final report

Tell the human:
- What was captured in the bail log
- Whether the issue spec was updated
- Whether CLAUDE.md was updated
- Exact command to clean up the worktree from the main repo

## Rules

- Keep this fast — the human is frustrated, don't make it worse
- Never try to fix the problem — the session is being abandoned, not recovered
- Always write the bail log before discarding changes
- One CLAUDE.md proposal maximum — don't pile on
- Be honest about why it failed — optimistic bail logs help no one
