# Repository Map

Use this file to quickly locate functionality before making changes.

> This is a template. Update all sections when starting a new project.

---

## Directory Structure

```
/
├── CLAUDE.md                   # AI entry point — read first
├── .claude/                    # Claude Code configuration
│   ├── settings.json           # permissions and PostToolUse hooks
│   └── commands/               # slash commands
│       ├── commit-push-pr.md
│       ├── verify.md
│       ├── code-review.md
│       └── simplify.md
├── .mcp.json                   # MCP servers (Playwright)
├── .github/
│   └── workflows/
│       └── ci.yml              # lint, typecheck, test, Claude review
├── ai/                         # AI context files
│   ├── system-invariants.md
│   ├── agent-bootstrap.md
│   ├── ai-guide.md
│   ├── repo-map.md             # this file
│   └── allowed-changes.md
├── prisma/
│   ├── schema.prisma           # Database schema and models
│   └── migrations/             # Migration history — commit these
├── src/
│   ├── domain/                 # Core business logic
│   ├── services/               # Workflows and orchestration
│   ├── infrastructure/
│   │   └── database/
│   │       └── client.ts       # Prisma client singleton — import this, not @prisma/client directly
│   └── utils/                  # Reusable helpers
└── tests/                      # Test suite
```

---

## Where to Make Changes

| Type of change | Location |
|---|---|
| Business logic / rules | `src/domain/` |
| Workflow / multi-step processes | `src/services/` |
| API calls, DB queries, file I/O | `src/infrastructure/` |
| Generic reusable helpers | `src/utils/` |
| Behavior verification | `tests/` |

---

## Key Modules

> Fill this section in when cloning the template.
> List the main modules and what they do.

| Module | Path | Responsibility |
|---|---|---|
| [example] UserAuth | `src/domain/auth/` | Validates credentials, manages sessions |
| [example] EmailService | `src/infrastructure/email/` | Sends transactional email via SendGrid |

---

## Entry Points

> Fill in the main entry points for this project.

| Entry point | Path | Description |
|---|---|---|
| [example] API server | `src/index.ts` | Starts the HTTP server |
| [example] Worker | `src/worker.ts` | Background job processor |

---

## Frozen / Sensitive Areas

> List any modules that should not be modified without explicit discussion.

| Area | Reason |
|---|---|
| [example] `src/infrastructure/payments/` | PCI-sensitive, requires security review |

---

## External Dependencies

> List key third-party dependencies and what they're used for.
> Update this when dependencies change.

| Package | Purpose |
|---|---|
| [fill in] | |
