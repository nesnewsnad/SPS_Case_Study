---
name: open-session
description: Start a coding session — reads last session log or checkpoint, orients you
---

# Open Session

Use at the start of every new conversation.

## Workflow

1. Check if `.continue-here.md` exists in the repo root
   - If YES: read it, present the state summary, ask "Resume from checkpoint?", then delete and commit the deletion
   - If NO: continue to step 2

2. Find the latest session log:
   ```bash
   ls -t docs/sessions/*.md 2>/dev/null | head -1
   ```

3. Read and summarize:
   - What was accomplished last session
   - What the next steps were
   - Current state of TODO.md (what's up next)

4. Report to user:
   - 3-5 bullet points max
   - End with "Ready to work on [next TODO item]?"

## Rules

- ALWAYS check for `.continue-here.md` first
- ALWAYS read TODO.md for current priorities
- ALWAYS read CLAUDE.md for project context
- Keep the summary concise — this is orientation, not a deep dive
- If no session logs exist yet, say so and point to TODO.md
