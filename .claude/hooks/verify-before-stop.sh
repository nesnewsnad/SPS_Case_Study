#!/bin/bash
# Stop hook: verify no uncommitted changes to key files before session ends

cd "$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0

# Check for uncommitted changes to project files
changed_files=$(git diff --name-only HEAD 2>/dev/null)
staged_files=$(git diff --cached --name-only 2>/dev/null)
untracked_files=$(git ls-files --others --exclude-standard 2>/dev/null)

all_changes="$changed_files"$'\n'"$staged_files"$'\n'"$untracked_files"

# Filter to project files (ts, tsx, js, jsx, css, py, json, html)
project_changes=$(echo "$all_changes" | grep -E '\.(ts|tsx|js|jsx|css|py|json|html)$' | sort -u | grep -v '^$')

if [ -n "$project_changes" ]; then
  echo "WARNING: Uncommitted project file changes detected:" >&2
  echo "$project_changes" >&2
  echo "" >&2
  echo "Consider committing these changes or running /continue-here before ending the session." >&2
  exit 2
fi

exit 0
