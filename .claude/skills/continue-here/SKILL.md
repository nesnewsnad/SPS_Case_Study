---
name: continue-here
description: Mid-session checkpoint — capture state for resumption
---

# Continue Here

Use when: stopping mid-implementation, long context, task switching.

## Workflow

1. Assess current state:
   - Which spec is in progress?
   - Which ACs are done vs. remaining?
   - Any uncommitted changes?

2. Check git state:
   ```bash
   git status
   git diff --stat
   git log --oneline -5
   ```

3. Write `.continue-here.md` in repo root with:
   - **Created**: date and time
   - **Task**: what we're working on (spec number, description)
   - **Branch**: current branch
   - **What's Done**: completed items this session
   - **What's Remaining**: items still to do
   - **In-Progress State**: partial work, open questions
   - **Decisions Made This Session**: especially failed approaches and why
   - **Next Action**: MUST be specific — exact file, exact function, exact line number if applicable

4. Commit:
   ```bash
   git add .continue-here.md && git commit -m "checkpoint: <brief description>"
   ```

5. Do NOT push — this is a local resumption aid only

## Rules

- **Be specific in Next Action** — "continue implementing filters" is BAD. "Add state filter dropdown to filterBar div in index.html, wire to updateCharts() function" is GOOD.
- **Capture decisions** — especially failed approaches and WHY they failed
- **List uncommitted changes** — what files are dirty and what state they're in
- **One checkpoint at a time** — if `.continue-here.md` already exists, overwrite it
- Checkpoints are temporary — deleted on resumption by `/open-session`
