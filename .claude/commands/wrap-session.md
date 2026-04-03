# Wrap Session

You are running in the current session with full context of what just happened.
Your job is to capture lessons, write a session log, and propose any CLAUDE.md
updates for human approval — before the context is lost to /commit-push-pr.

---

## Step 1 — Ask the human one question

> "Before I write the session log, please run /cost and paste the token count.
> Also rate this session: smooth / some friction / went sideways"

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
<Anything that caused confusion, required retries, or revealed a gap in the
context files. These are candidates for CLAUDE.md or project-notes updates.>

## Open questions
<Anything unresolved that the next session should pick up.>
```

## Step 3 — Propose updates

Based on "Patterns noticed", identify specific additions that would prevent
the same confusion in future sessions. Route each to the most specific file
that owns that scope:

| Type of lesson | Destination |
|---|---|
| Absolute rule that must never be broken | `ai/core/system-invariants.md` |
| Workflow or process confusion | `ai/core/agent-bootstrap.md` |
| Layer or singleton location | `ai/core/repo-map.md` |
| Project-specific gotcha or domain rule | `ai/core/project-notes.md` |
| Code convention or naming confusion | `ai/supplementary/ai-guide.md` |
| Scope / authorization confusion | `ai/supplementary/allowed-changes.md` |
| Exact file path or module detail | `ai/supplementary/repo-map.md` |
| Project overview or session workflow | `CLAUDE.md` |

Present proposals numbered, like:

```
Proposed update #1:
Pattern: <what caused the confusion>
Addition: "<exact text to add>"
File: <which file>
Section: <which section>

Approve? (yes / no / modify)
```

Wait for approval on each before applying any.

## Step 4 — Apply approved updates

Edit the appropriate files and confirm each edit was applied.

## Step 5 — Stage the session log

```bash
git add ai/sessions/
```

The session log will be included in the commit that /commit-push-pr creates next.

## Rules

- Never update any context file without explicit approval for each change
- Never skip the /cost prompt — token data is important even if approximate
- If the session was smooth with no failures, the log is short — that's fine
- Session logs are permanent record — be honest, not optimistic
- Draw on your live memory of the session, not just git artifacts
