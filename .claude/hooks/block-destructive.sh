#!/bin/bash
# PreToolUse hook: block destructive commands
# Reads tool input JSON from stdin, checks first line of command only
# (prevents false positives from heredoc content)

input=$(cat)
command=$(echo "$input" | jq -r '.command // empty' 2>/dev/null)

# Only check the first line
first_line=$(echo "$command" | head -1)

if echo "$first_line" | grep -qE '^rm -rf|^rm -fr'; then
  echo "BLOCKED: rm -rf detected. Ask the user for confirmation first."
  exit 2
fi

if echo "$first_line" | grep -qE '^git push --force|^git push -f '; then
  echo "BLOCKED: force push detected. Ask the user for confirmation first."
  exit 2
fi

if echo "$first_line" | grep -qE '^git reset --hard'; then
  echo "BLOCKED: git reset --hard detected. Ask the user for confirmation first."
  exit 2
fi

if echo "$first_line" | grep -qE '^git checkout \.$'; then
  echo "BLOCKED: git checkout . detected. Ask the user for confirmation first."
  exit 2
fi

if echo "$first_line" | grep -qE '^git restore \.$'; then
  echo "BLOCKED: git restore . detected. Ask the user for confirmation first."
  exit 2
fi

if echo "$first_line" | grep -qE '^git clean -f'; then
  echo "BLOCKED: git clean -f detected. Ask the user for confirmation first."
  exit 2
fi

if echo "$first_line" | grep -qE '^git branch -D'; then
  echo "BLOCKED: git branch -D detected. Ask the user for confirmation first."
  exit 2
fi

exit 0
