#!/bin/bash
# Stop hook: verify no uncommitted changes to key files before session ends
# Timeout: 120s

cd /Users/danswensen/Desktop/SPS_Case_Study || exit 0

# Check for uncommitted changes to HTML/JS/CSS/Python files
changed_files=$(git diff --name-only HEAD 2>/dev/null)
staged_files=$(git diff --cached --name-only 2>/dev/null)
untracked_files=$(git ls-files --others --exclude-standard 2>/dev/null)

all_changes="$changed_files"$'\n'"$staged_files"$'\n'"$untracked_files"

# Filter to project files (html, js, css, py, json)
project_changes=$(echo "$all_changes" | grep -E '\.(html|js|css|py|json)$' | sort -u | grep -v '^$')

if [ -n "$project_changes" ]; then
  echo "WARNING: Uncommitted project file changes detected:"
  echo "$project_changes"
  echo ""
  echo "Consider committing these changes or running /continue-here before ending the session."
  # Exit 2 would block stopping — using exit 1 to warn but not block
  # Change to exit 2 if you want hard enforcement
  exit 2
fi

exit 0
