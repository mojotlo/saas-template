# Load Context

You have just started a new session. Before responding to any request or
taking any action, read and confirm every context file in order.

This is not optional. Do not proceed until all files are read.

## Read these files in order

```bash
cat CLAUDE.md
cat ai/core/system-invariants.md
cat ai/core/agent-bootstrap.md
cat ai/core/repo-map.md
cat ai/core/project-notes.md
```

Do not read the supplementary files during load-context. They are loaded on demand
when the task requires them, as described in CLAUDE.md.

## Then name the session

Run the following to detect the branch and name the session:

```bash
git branch --show-current
```

- If the branch is `feat/issue-N`, run `gh issue view N --json title -q .title` to get
  the issue title, then execute `/rename "#N: [title]"`
- If the branch is `main` or there is no issue branch, execute `/rename "main: [brief description of task]"`

## Then confirm

After reading all files and renaming, respond with:

```
✅ Session initialized. I have read:
- CLAUDE.md — [one sentence summary of the project brief]
- core/system-invariants.md — [number] invariants loaded
- core/agent-bootstrap.md — workflow and TDD rules loaded
- core/repo-map.md — layer map loaded
- core/project-notes.md — [number] project-specific notes loaded

Supplementary files (ai-guide, allowed-changes, full repo-map, ADRs) will be
loaded when the task requires them.

Ready. What would you like to work on?
```

## Rules

- Do not summarize or skip any core file — read the full content of each
- Do not begin any task until this confirmation is complete
- If a file is missing, report which one is missing before proceeding
- If the Project Brief in CLAUDE.md is still a placeholder (contains "> Replace this"),
  note that it needs to be filled in
