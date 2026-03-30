# ADR-005: CI — GitHub Actions + Claude Code Review

**Status:** Accepted
**Date:** 2026-03-25
**Revisit when:** Team grows beyond solo, need more sophisticated pipelines, or cost becomes a factor

---

## Decision

Use GitHub Actions for CI with four jobs: typecheck, lint, test, and Claude automated code review.

---

## Why — GitHub Actions

- **Zero additional cost** — included with GitHub, no separate CI service to manage
- **Repo-native** — workflow files live in `.github/workflows/`, travel with the repo
- **Ecosystem** — largest action marketplace, every tool has a GitHub Action
- **Simplicity** — for solo projects, a single `ci.yml` covers all needs

## Why — Claude Code Review

- **Catches what tests miss** — architectural violations, naming issues, missing error handling
- **Consistent** — applies the same standards on every PR regardless of how tired you are
- **OAuth token** — runs against your Pro/Max subscription, no separate API credits needed
- **Human gate preserved** — Claude comments, you decide whether to merge

---

## Alternatives considered

| Option | Reason not chosen |
|---|---|
| **CircleCI** | Better for large teams, overkill and additional cost for solo projects |
| **Vercel CI** | Good for Next.js deployments but not a general-purpose CI solution |
| **Buildkite** | Enterprise-grade, unnecessary complexity at this scale |
| **No automated review** | Too easy to let standards slip over time; Claude review is low-cost insurance |

---

## Current CI pipeline

```
On every PR and push to main:

typecheck   →  tsc --noEmit (catches type errors)
lint        →  eslint (catches code quality issues)
test        →  npm test (verifies behavior)
claude-review → automated PR review (on PRs only)
```

---

## Upgrade triggers

- Team grows → add branch protection rules, required reviewers, status checks
- Need deployment pipeline → add deploy job to `ci.yml` or use Vercel/Railway integration
- Tests get slow (>5 min) → add job parallelization or test splitting
- Need environments (staging/prod) → add environment-specific workflow files
- Python backend added → Python CI job already scaffolded in `ci.yml`, just uncomment
