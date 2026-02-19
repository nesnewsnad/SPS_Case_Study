# Spec Process

Adopted from Framework_Build, enhanced with GSD verification methodology.

## Pre-Spec Flow

1. `/discuss` — identify gray areas, lock decisions into CONTEXT doc
2. `/research` — investigate data/tools/domain, produce findings with confidence levels
3. Write spec using CONTEXT + RESEARCH as inputs

## Spec Format

Required sections:

### Problem
What user need or deliverable requirement does this address?

### Behavior
What should the implementation do? Describe from the user's perspective.

### Acceptance Criteria
Numbered list. Each AC must be:
- **Testable**: you can write a concrete verification step
- **Scoped**: clear boundaries, no ambiguity
- **Measurable**: pass/fail, not subjective

### Non-Goals
What this spec explicitly does NOT cover. Be specific enough to prevent scope creep.

### Dependencies
Which other specs must be complete first? Reference by number.

## Amendments

If a spec needs to change after writing:
- Add `## Amendments` section at the bottom
- Each entry: date, what changed, why
- Amend the spec BEFORE changing the code
- Never delete original ACs — mark them as amended and add new ones
- Append-only

## Numbering

- Sequential: SPEC-001, SPEC-002, etc.
- Numbers never reused
- File naming: `docs/specs/SPEC-NNN-short-description.md`

## Verification

After implementation, run `/verify NNN` in a SEPARATE session (writer/reviewer separation).

Three-level goal-backward methodology:
1. **Exists** — artifact/feature is present
2. **Substantive** — real implementation, not a stub
3. **Wired** — connected to the rest of the system and functional

Verification report saved to `docs/specs/SPEC-NNN-verification.md`
