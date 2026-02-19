Goal-backward verification of spec implementation. Usage: /project:verify NNN

MUST be run in a session that did NOT write the implementation code (writer/reviewer separation).

Load spec from `docs/specs/SPEC-NNN-*.md`. Start from "What must be TRUE for this to be done?" For EVERY AC, verify at three levels:
1. **Exists** — artifact/feature present (file, DOM element, function)
2. **Substantive** — real implementation, not stub (no TODO comments, no placeholders, no empty functions)
3. **Wired** — connected and functional (event handlers attached, data flows, filters update charts)

Scan for stubs: TODO/FIXME/PLACEHOLDER, empty bodies, hardcoded sample data, console.log debris, commented-out code. Check scope creep against non-goals. If HTML dashboard, open and verify observable truths.

Save report to `docs/specs/SPEC-NNN-verification.md`. Be honest — PARTIAL not PASS if anything is incomplete.

$ARGUMENTS
