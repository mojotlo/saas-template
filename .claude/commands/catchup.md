# Catchup

You have just been given a fresh context window in an active worktree session.
Re-orient yourself by reading the repository state — do not ask the human to
explain what's happening.

## Step 1 — Understand the branch and issue

```bash
git branch --show-current          # what branch are we on
git log main..HEAD --oneline       # what commits have been made this session
git diff main --stat               # what files have changed
git status                         # what's staged or unstaged right now
```

If the branch name contains an issue number, run:
```bash
gh issue view <N>                  # read the full spec
```

## Step 2 — Understand the current state

```bash
cat test-results/summary.txt       # last test run result (if it exists)
cat CLAUDE.md                      # project context and rules
```

If there are uncommitted changes, read the changed files to understand
what was being worked on when the session was interrupted.

## Step 3 — Report back

Tell the human:
- What issue you're working on and what it involves
- What has been completed so far (from git log)
- What is currently in progress (from git status + changed files)
- Current test state (from summary.txt)
- What the logical next step is

Keep it concise — 5-8 sentences. The human wants to know where things
stand and what happens next, not a full recap of everything.

## Then ask

"Ready to continue — shall I proceed with [next logical step]?"

## Rules

- Never ask the human "what were we working on?" — figure it out yourself
- Never re-read files you don't need — keep the catchup fast
- If tests are failing, say so clearly upfront
- If there's nothing in progress (clean working tree, all tests passing),
  say so and ask what to work on next
