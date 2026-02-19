---
name: close-session
description: End a coding session — write session log, commit, push
---

# Close Session

Use at the end of every work period.

## Workflow

1. Create session log at `docs/sessions/YYYY-MM-DD.md` with:
   - **Goals**: What we set out to do
   - **Accomplishments**: What was actually done (with specifics — file names, spec numbers, commit hashes)
   - **Files Changed**: List of files created or modified
   - **Commits**: List of commits made this session
   - **Next Steps**: Specific actions for the next session (not vague — exact spec, exact task)

2. Commit the session log:
   ```bash
   git add docs/sessions/YYYY-MM-DD.md && git commit -m "Add session log for YYYY-MM-DD"
   ```

3. Push:
   ```bash
   git push
   ```

4. Verify:
   ```bash
   git status
   ```
   Should show "up to date with origin"

5. Report with checkmarks for each completed step

## Rules

- NEVER skip the session log
- NEVER leave unpushed commits
- YOU must push — don't say "ready when you are"
- If multiple sessions in one day, append to the existing day's log with a section header (e.g., "## Session 2")
- Session logs are append-only — never edit previous entries
