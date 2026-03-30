# Claude Template

A base project template for AI-assisted TypeScript development with Claude Code.

---

## What's Included

- **Claude Code config** — slash commands, permissions, PostToolUse formatting hook
- **GitHub Actions CI** — typecheck, lint, test, and Claude code review on every PR
- **Prisma + Neon** — PostgreSQL setup with a clean infrastructure layer
- **Prettier + ESLint** — TypeScript formatting and linting pre-configured
- **Playwright MCP** — browser visibility for Claude's verification loop

---

## Using This Template

### 1. Clone and install

```bash
git clone https://github.com/mojotlo/template.git my-project
cd my-project
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in your database credentials from your [Neon dashboard](https://neon.tech).
You need two connection strings — pooled for app queries, direct for migrations:

```
DATABASE_URL=postgresql://...?pgbouncer=true
DIRECT_DATABASE_URL=postgresql://...
```

### 3. Update project-specific files

- `package.json` — update `name`, add your actual `dev` script
- `CLAUDE.md` — fill in stack details and project-specific notes
- `ai/repo-map.md` — map your actual modules as you build them
- `ai/allowed-changes.md` — add any frozen or sensitive areas

### 4. Set up GitHub Actions

Add `CLAUDE_CODE_OAUTH_TOKEN` as a repository secret (Settings → Secrets → Actions).
Generate the token by running `claude setup-token` in your terminal.

### 5. Add your first database model

Edit `prisma/schema.prisma`, add your models, then run:

```bash
npx prisma migrate dev --name init
```

This creates your first migration and generates the Prisma client.
Always import the client from `src/infrastructure/database/client.ts`,
never directly from `@prisma/client`.

---

## Parallel Development with Worktrees

Work on multiple features simultaneously using git worktrees — each issue gets
its own directory and branch, with its own Claude Code session.

```bash
# Start a new feature (creates worktree + branch + opens Claude Code)
npm run worktree:new 3
# Claude Code opens in ../my-project-issue-3
# Tell it: "Implement issue #3"

# After PR is merged, clean up
npm run worktree:cleanup 3
# Removes directory, deletes branch, pulls latest main
```

Run multiple worktrees in parallel from separate terminal tabs. Each Claude Code
session is isolated — no conflicts between parallel agents.

**Tip:** Enable "Automatically delete head branches" in your GitHub repo settings
(Settings → General) so remote branches clean up automatically on merge.

---

## Development Workflow

```
Plan mode        → agree on spec before writing any code
Code mode        → implement; Claude loops until tests pass
/simplify        → clean up without changing behavior
/verify          → browser + tests confirm the app works
/code-review     → catch issues before committing
/commit-push-pr  → commit, push, open PR, monitor CI
```

The PR is the human gate. CI runs automatically on every PR.

---

## Commands

```bash
npm run dev          # start development server
npm run build        # production build
npm run typecheck    # TypeScript type check
npm run lint         # lint check
npm test             # run test suite
```

```bash
npx prisma migrate dev       # create and apply a migration
npx prisma migrate deploy    # apply migrations in production
npx prisma generate          # regenerate client after schema changes
npx prisma studio            # open database GUI
```

---

## Architecture

```
src/
├── domain/              # Pure business logic — no side effects
├── services/            # Orchestration — composes domain logic
├── infrastructure/
│   └── database/
│       └── client.ts    # Prisma client singleton
└── utils/               # Stateless helpers

prisma/
├── schema.prisma        # Database schema
└── migrations/          # Migration history — always commit these
```

Dependency direction: `infrastructure → services → domain`. Domain never
imports from services or infrastructure.

---

## AI Context Files

Claude reads these files at the start of every session:

| File | Purpose |
|---|---|
| `CLAUDE.md` | Entry point — stack details, workflow, project notes |
| `ai/system-invariants.md` | Rules that must never be violated |
| `ai/agent-bootstrap.md` | Task workflow and planning process |
| `ai/ai-guide.md` | Architecture and implementation patterns |
| `ai/repo-map.md` | Where to find things in this repo |
| `ai/allowed-changes.md` | What Claude can and cannot change |

Update these files whenever Claude does something wrong so it won't repeat the mistake.
