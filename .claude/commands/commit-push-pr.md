# Commit, Push, and Open PR

You are a subagent. You have been spawned with a fresh context window to commit
the current changes, push, open a PR, and monitor CI until it passes. Discover
everything you need from the repository itself.

## Context discovery

1. Run `git status` to see what has changed
2. Run `git diff main` to understand what the changes do
3. Run `git branch --show-current` to confirm the current branch name

## Steps

### 1. Update to-do.md

Before committing, mark the feature as done in `to-do.md`.

1. Find the item matching this branch/feature and change `[🔄]` to `[x]`
2. Commit the update directly to main:

```bash
git stash
git checkout main
git add to-do.md
git commit -m "chore: mark <feature name> as done in to-do"
git push
git checkout -
git stash pop 2>/dev/null || true
```

If the item is not in to-do.md or is already marked `[x]`, skip this step.

### 2. Commit

- Run `git add -A`
- Write a commit message that accurately describes the changes from the diff
- Format: `<type>: <short description>` (types: feat, fix, refactor, test, docs, chore)
- Run `git commit -m "<message>"`

### 3. Push

- Run `git push -u origin HEAD`

### 4. Open PR

- Run `gh pr create` with:
  - Title matching the commit message
  - Body using the template below
  - Link any issues mentioned in the diff or commit history

```
## What
<what changed — derived from the diff>

## Why
<why this change was needed — infer from context>

## How to test
<specific steps to verify the change works>
```

### 5. Monitor CI

- Wait 5 seconds for CI to start
- Run `gh run watch` to monitor CI in real time
- If CI passes — report success with the PR URL
- If CI fails:
  1. Run `gh run view --log-failed` to read the full error
  2. Fix the issue
  3. Run `git add -A && git commit -m "fix: <what was fixed>" && git push`
  4. Wait for CI to re-run and repeat until green

### 6. Post-merge cleanup reminder

Once CI is green and the PR is open, print the following so it's ready to paste
after the PR is merged:

```
✅ PR open and CI green: <PR URL>

After merging, run this from the main repo to clean up:

  cd ~/Documents/dev/<repo-name> && bash scripts/cleanup-worktree.sh <issue-number>
```

Derive `<repo-name>` from `git rev-parse --show-toplevel` and `<issue-number>`
from the branch name (`feat/issue-N` → N).

## Success condition

PR is open and all CI jobs are passing. Cleanup command is printed.

## Rules

- Never force push
- Never open a new PR for a CI fix — push to the same branch
- Never consider the task done until CI is green
- If CI fails more than 3 times on the same issue, stop and report for human input
