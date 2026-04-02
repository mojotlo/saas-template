#!/usr/bin/env bash
# cleanup-worktree.sh
# Cleans up a git worktree after its PR has been merged.
#
# Usage: ./scripts/cleanup-worktree.sh <issue-number>
# Example: ./scripts/cleanup-worktree.sh 3
#
# What it does:
#   1. Confirms the PR for this branch has been merged
#   2. Removes the local worktree directory
#   3. Deletes the local branch
#   4. Prunes stale worktree references
#   5. Pulls latest main so you're up to date

set -e

# Validate argument
if [ -z "$1" ]; then
  echo "Usage: ./scripts/cleanup-worktree.sh <issue-number>"
  exit 1
fi

ISSUE=$1
REPO_NAME=$(basename "$(git rev-parse --show-toplevel)")
BRANCH="feat/issue-$ISSUE"
WORKTREE_PATH="../$REPO_NAME-issue-$ISSUE"

# Check that we're in the main repo, not the worktree
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "⚠ Run this script from the main repo directory on the main branch."
  echo "  Current branch: $CURRENT_BRANCH"
  exit 1
fi

# Check if PR is merged before cleaning up
echo "→ Checking PR status for branch $BRANCH..."
PR_STATE=$(gh pr list --head "$BRANCH" --state merged --json number --jq '.[0].number' 2>/dev/null)

if [ -z "$PR_STATE" ]; then
  echo "⚠ No merged PR found for branch $BRANCH."
  echo "  Either the PR hasn't merged yet, or the branch name is different."
  read -p "  Continue cleanup anyway? (y/N) " CONFIRM
  if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Aborted."
    exit 1
  fi
else
  echo "  ✓ PR #$PR_STATE is merged."
fi

# Remove the worktree directory
if [ -d "$WORKTREE_PATH" ]; then
  echo "→ Removing worktree at $WORKTREE_PATH..."
  git worktree remove "$WORKTREE_PATH" --force
else
  echo "  Worktree directory not found — may already be removed."
fi

# Delete the local branch
if git branch --list "$BRANCH" | grep -q "$BRANCH"; then
  echo "→ Deleting local branch $BRANCH..."
  git branch -D "$BRANCH"
else
  echo "  Local branch $BRANCH not found — may already be deleted."
fi

# Prune stale references
echo "→ Pruning stale worktree references..."
git worktree prune

# Pull latest main
echo "→ Pulling latest main..."
git pull

echo ""
echo "✓ Cleanup complete for issue #$ISSUE"
echo "  Worktree removed, branch deleted, main is up to date."
