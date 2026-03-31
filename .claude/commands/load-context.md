# Load Context

You have just started a new session. Before responding to any request or
taking any action, read and confirm every context file in order.

This is not optional. Do not proceed until all files are read.

## Read these files in order

```bash
cat CLAUDE.md
cat ai/system-invariants.md
cat ai/agent-bootstrap.md
cat ai/ai-guide.md
cat ai/repo-map.md
cat ai/allowed-changes.md
cat ai/decisions/README.md
```

## Then confirm

After reading all files, respond with:

```
✅ Session initialized. I have read:
- CLAUDE.md — [one sentence summary of the project brief]
- system-invariants.md — [number] invariants loaded
- agent-bootstrap.md — workflow and TDD rules loaded
- ai-guide.md — architecture: [one sentence summary of layers]
- repo-map.md — [number] key modules mapped
- allowed-changes.md — scope boundaries loaded
- decisions/README.md — [number] ADRs loaded

Ready. What would you like to work on?
```

## Rules

- Do not summarize or skip any file — read the full content of each
- Do not begin any task until this confirmation is complete
- If a file is missing, report which one is missing before proceeding
- If the Project Brief in CLAUDE.md is still a placeholder (contains "> Replace this"),
  note that it needs to be filled in
