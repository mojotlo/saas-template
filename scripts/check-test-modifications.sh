#!/usr/bin/env bash
# check-test-modifications.sh
# Warns when existing test files have been modified.
# Used as a pre-commit check and by the code-review subagent.
#
# Usage: bash scripts/check-test-modifications.sh
# Exit code 0 = no modifications, 1 = modifications found

# Find test files that were modified (not newly added)
MODIFIED_TESTS=$(git diff --name-only HEAD 2>/dev/null | grep '\.test\.ts$')
STAGED_MODIFIED=$(git diff --cached --name-only --diff-filter=M | grep '\.test\.ts$')

ALL_MODIFIED="$MODIFIED_TESTS $STAGED_MODIFIED"
ALL_MODIFIED=$(echo "$ALL_MODIFIED" | tr ' ' '\n' | sort -u | grep -v '^$')

if [ -z "$ALL_MODIFIED" ]; then
  exit 0
fi

echo ""
echo "⚠️  WARNING: Existing test files have been modified"
echo "─────────────────────────────────────────────────"
echo "$ALL_MODIFIED"
echo ""
echo "Modified tests require explicit human approval."
echo "Per system-invariants.md: tests are frozen once committed."
echo ""
echo "If this modification is intentional, explain why in your commit message."
echo "If this is unintentional, restore the original test:"
echo "  git checkout HEAD -- <test-file>"
echo ""

exit 1
