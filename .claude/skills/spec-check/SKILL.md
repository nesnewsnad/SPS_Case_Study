---
name: spec-check
description: Pre-implementation readiness check on a spec
---

# Spec Check

Usage: `/spec-check 001` or `/spec-check SPEC-001`

## Workflow

1. Load the spec from `docs/specs/SPEC-NNN-*.md` (glob match on the number)

2. **AC Quality**: For each acceptance criterion, check:
   - Is it testable? (Can you write a concrete verification step?)
   - Is it scoped? (Does it have clear boundaries?)
   - Is it measurable? (Pass/fail, not subjective?)
   - Flag vague language: "should work well", "handles errors appropriately", "looks good"

3. **Dependencies**: Are dependent specs (listed in Dependencies section) marked complete in TODO.md?

4. **Reuse Opportunities**: Search the codebase for existing relevant code/patterns:
   - Existing chart components
   - Existing filter logic
   - Existing data processing utilities
   - Shared CSS patterns

5. **Non-Goals**: Are they specific enough to prevent scope creep?

6. **Implicit Decisions**: Any architecture choices baked into the spec without rationale?

## Output Format

```
## Spec Check: SPEC-NNN — <title>

### AC Quality
| AC | Testable | Scoped | Measurable | Issues |
|---|---|---|---|---|

### Dependencies
<status of each dependency>

### Reuse Opportunities
<existing code that could be leveraged>

### Non-Goals
<verdict: specific enough? or needs tightening?>

### Implicit Decisions
<any hidden assumptions>

### Verdict: READY / READY WITH NOTES / NEEDS REVISION
```

## Rules

- Do NOT modify the spec — report findings only
- Be specific — "AC 3 is vague" is bad. "AC 3 says 'filters work correctly' — what does 'correctly' mean? Suggest: 'selecting CA in state filter shows only CA claims and updates all charts within 200ms'" is good.
- Check the codebase, not just the spec
