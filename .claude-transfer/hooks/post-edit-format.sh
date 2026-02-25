#!/bin/bash
# PostToolUse hook: auto-format files with Prettier after edits
# Only runs if prettier is available in the project

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

# Skip if no file path
[ -z "$file_path" ] && exit 0

# Only format supported file types
case "$file_path" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md)
    cd "$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
    # Only run if prettier is available in this project
    if [ -f "node_modules/.bin/prettier" ] || command -v prettier &>/dev/null; then
      npx prettier --write "$file_path" 2>/dev/null
    fi
    ;;
esac

exit 0
