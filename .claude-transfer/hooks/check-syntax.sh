#!/bin/bash
# PostToolUse hook: check syntax after file edits
# Runs on TS/TSX/JS/JSON/Python files

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

# Skip if no file path
[ -z "$file_path" ] && exit 0

# Check TypeScript/TSX files with tsc (syntax only, fast)
if [[ "$file_path" == *.ts || "$file_path" == *.tsx ]]; then
  cd "$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
  errors=$(npx tsc --noEmit --pretty false 2>&1 | grep "^${file_path}" | head -5)
  if [ -n "$errors" ]; then
    echo "TypeScript errors in $file_path:" >&2
    echo "$errors" >&2
    exit 2
  fi
fi

# Check Python files with python -m py_compile
if [[ "$file_path" == *.py ]]; then
  if ! python3 -m py_compile "$file_path" 2>&1; then
    echo "SYNTAX ERROR in $file_path" >&2
    exit 2
  fi
fi

# Check JS files with node --check (if node available)
if [[ "$file_path" == *.js ]]; then
  if command -v node &>/dev/null; then
    if ! node --check "$file_path" 2>&1; then
      echo "SYNTAX ERROR in $file_path" >&2
      exit 2
    fi
  fi
fi

# Check JSON files with python json module
if [[ "$file_path" == *.json ]]; then
  if ! python3 -c "import json; json.load(open('$file_path'))" 2>&1; then
    echo "SYNTAX ERROR in $file_path — invalid JSON" >&2
    exit 2
  fi
fi

exit 0
