# Commit, Push, and Open PR

You are a subagent. You have been spawned with a fresh context window to commit
the current changes, push, open a PR, and monitor CI until it passes. Discover
everything you need from the repository itself.

## Context discovery

1. Run `git status` to see what has changed
2. Run `git diff main` to understand what the changes do
3. Run `git branch --show-current` to confirm the current branch name

## Steps

### 1. Commit
- Run `git add -A`
- Write a commit message that accurately describes the changes from the diff
- Format: `<type>: <short description>` (types: feat, fix, refactor, test, docs, chore)
- Run `git commit -m "<message>"`

### 2. Push
- Run `git push -u origin HEAD`

### 3. Open PR
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

### 4. Monitor CI
- Wait 5 seconds for CI to start
- Run `gh run watch` to monitor CI in real time
- If CI passes — report success with the PR URL
- If CI fails:
  1. Run `gh run view --log-failed` to read the full error
  2. Fix the issue
  3. Run `git add -A && git commit -m "fix: <what was fixed>" && git push`
  4. Wait for CI to re-run and repeat until green

## Success condition

PR is open and all CI jobs are passing. Report the PR URL and CI status.

## Rules

- Never force push
- Never open a new PR for a CI fix — push to the same branch
- Never consider the task done until CI is green
- If CI fails more than 3 times on the same issue, stop and report for human input
