#!/usr/bin/env bash
# new-worktree.sh
# Creates a new git worktree for a GitHub issue and opens Claude Code in it.
#
# Usage: ./scripts/new-worktree.sh <issue-number>
# Example: ./scripts/new-worktree.sh 3
#
# What it does:
#   1. Pulls latest main
#   2. Creates a new branch feat/issue-<N>
#   3. Creates a worktree directory at ../$(repo-name)-issue-<N>
#   4. Prints the gh issue view so you can see the spec
#   5. Opens Claude Code in the new worktree

set -e

# Validate argument
if [ -z "$1" ]; then
  echo "Usage: ./scripts/new-worktree.sh <issue-number>"
  exit 1
fi

ISSUE=$1
REPO_NAME=$(basename "$(git rev-parse --show-toplevel)")
BRANCH="feat/issue-$ISSUE"
WORKTREE_PATH="../$REPO_NAME-issue-$ISSUE"

# Make sure we're on main and up to date
echo "→ Pulling latest main..."
git checkout main
git pull

# Create the worktree + branch
echo "→ Creating worktree at $WORKTREE_PATH on branch $BRANCH..."
git worktree add "$WORKTREE_PATH" -b "$BRANCH"

# Show the issue spec
echo ""
echo "→ Issue #$ISSUE spec:"
echo "─────────────────────────────────────────"
gh issue view "$ISSUE"
echo "─────────────────────────────────────────"
echo ""

# Open Claude Code in the new worktree
echo "→ Opening Claude Code in $WORKTREE_PATH..."
echo "   Tip: tell Claude 'Implement issue #$ISSUE'"
echo ""
cd "$WORKTREE_PATH" && claude
