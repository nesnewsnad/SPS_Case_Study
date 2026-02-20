#!/bin/bash
# PostToolUse hook: auto-format files with Prettier after edits

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

# Only format files in our project
case "$file_path" in
  */SPS_Case_Study/*)
    ;;
  *)
    exit 0
    ;;
esac

# Only format supported file types
case "$file_path" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md)
    cd "$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
    npx prettier --write "$file_path" 2>/dev/null
    ;;
esac

exit 0
