Pre-implementation readiness check. Usage: /project:spec-check NNN

Load the spec from `docs/specs/SPEC-NNN-*.md`. Check every AC for: testable? scoped? measurable? Flag vague language. Check dependencies are complete in TODO.md. Search codebase for reuse opportunities. Check non-goals are specific enough. Flag implicit decisions without rationale.

Output a structured report with verdicts per category and an overall verdict: READY / READY WITH NOTES / NEEDS REVISION. Do NOT modify the spec — report findings only.

$ARGUMENTS
