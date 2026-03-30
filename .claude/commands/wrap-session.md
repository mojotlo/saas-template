# Wrap Session

You are a subagent. You have been spawned at the end of a feature build session
to write a session log, identify patterns, and propose CLAUDE.md updates for
human approval. Discover everything you need from the repository and git history.

## Step 1 — Gather context

Run the following to understand what happened this session:

```bash
git log main..HEAD --oneline          # commits made this session
git diff main --stat                  # files changed
git diff main                         # full diff
cat test-results/summary.txt          # final test state
```

Also ask the human one question before proceeding:

> "Before I write the session log, please run /cost in your Claude Code session
> and paste the token count here. Also rate this session:
> smooth / some friction / went sideways"

Wait for their response before continuing.

## Step 2 — Write the session log

Create a file at `ai/sessions/YYYY-MM-DD-<branch-name>.md` where:
- YYYY-MM-DD is today's date
- branch-name is the output of `git branch --show-current`

Use this structure:

```markdown
# Session: <branch name>
Date: <today>
Feature: <one sentence describing what was built>

## What was built
<2-3 sentences summarizing the implementation>

## Session health
- Flow: [smooth / some friction / went sideways]
- Token usage: <paste from /cost, or "not captured">
- Retries: <number of significant retries and what caused them>
- Compaction triggered: [yes / no]

## What failed and why
<For each significant failure: what happened, what was tried, what resolved it.
If everything went smoothly, write "No significant failures.">

## Key decisions made
<Any architectural choices, library selections, or pattern decisions made
during this session that aren't already documented in ai/decisions/>

## Patterns noticed
<Anything Claude got wrong, got confused about, or had to retry multiple times.
These are candidates for CLAUDE.md updates.>

## Open questions
<Anything unresolved that the next session should pick up.>
```

## Step 3 — Propose CLAUDE.md updates

Based on the "Patterns noticed" section, identify specific additions to CLAUDE.md
that would prevent the same confusion in future sessions.

For each proposed update:
1. State the pattern you observed
2. Write the exact text you'd add to CLAUDE.md
3. State which section it belongs in

Present them numbered, like:

```
Proposed CLAUDE.md update #1:
Pattern: Claude repeatedly tried to run prisma generate before checking for models
Addition: "Always check for models in schema.prisma before running prisma generate"
Section: Project-Specific Notes

Approve? (yes / no / modify)
```

Wait for approval on each one before applying any of them.

## Step 4 — Apply approved updates

For each approved update:
- Edit CLAUDE.md to add the approved text to the specified section
- Confirm each edit was applied

## Step 5 — Commit the session log

```bash
git add ai/sessions/
git add CLAUDE.md   # if any updates were approved
git commit -m "docs: add session log for <branch name>"
git push
```

## Rules

- Never update CLAUDE.md without explicit approval for each change
- Never skip the /cost prompt — token data is important even if approximate
- If the session was smooth with no failures, the log is short — that's fine
- Session logs are permanent record — be honest, not optimistic
- If patterns suggest a systemic issue (not just a one-off), flag it clearly
