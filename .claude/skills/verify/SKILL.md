---
name: verify
description: Goal-backward verification of spec implementation
---

# Verify

Usage: `/verify 001` or `/verify SPEC-001`

MUST be run in a session that did NOT write the implementation code (writer/reviewer separation).

## Workflow

1. **Load spec**: Read `docs/specs/SPEC-NNN-*.md`, extract all ACs, non-goals, dependencies

2. **Find implementation**: Check git log and current files for implementation work
   ```bash
   git log --oneline --all --grep="SPEC-NNN"
   ```

3. **Goal-backward check**: Start from "What must be TRUE for this spec to be done?"
   - Define the observable truths (what a user would see/experience)
   - Work backwards to artifacts and wiring

4. **Three-level verification for EVERY AC**:

   | Level | Question | How to Check |
   |---|---|---|
   | **Exists** | Does the artifact/feature exist? | File present, element in DOM, function defined |
   | **Substantive** | Is it real, not a stub? | Has actual logic, not placeholder text, not TODO comments |
   | **Wired** | Is it connected and functional? | Event handlers attached, data flows through, filters update charts |

5. **Stub detection** — scan for:
   - `// TODO`, `<!-- TODO -->`, `PLACEHOLDER`, `FIXME`
   - Empty function bodies
   - Hardcoded sample data where real data should be
   - Console.log debugging left in
   - Commented-out code blocks
   - Event handlers that don't do anything

6. **Scope creep check**: Compare implementation against non-goals. Was anything built that shouldn't have been?

7. **Browser test** (if applicable): Open the HTML file and manually verify the observable truths

8. **Save report** to `docs/specs/SPEC-NNN-verification.md`

## Output Format

```
## Verification: SPEC-NNN — <title>

### Goal Statement
<What must be TRUE for this to be done?>

### AC Verification
| AC | Exists | Substantive | Wired | Verdict | Evidence |
|---|---|---|---|---|---|

### Stub Detection
<any stubs, placeholders, or incomplete code found>

### Scope Creep
<anything built beyond the spec?>

### Browser Test
<results of opening and interacting with the dashboard>

### Overall: PASS / PARTIAL / FAIL
<summary and any blocking issues>
```

## Rules

- Every AC must be checked with evidence — not "looks good"
- Open the file in context and verify — don't trust git commit messages
- Do NOT modify code — report findings only
- Be honest — PARTIAL not PASS if anything is incomplete
- Stubs are automatic FAIL for that AC
