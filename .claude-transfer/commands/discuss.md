Pre-spec design conversation to lock decisions before writing a spec. Usage: /project:discuss or /project:discuss SPEC-NNN

Read the TODO item, CLAUDE.md, and any existing CONTEXT docs. Identify 3-6 gray areas — decisions that would change the outcome. For dashboard features: layout, chart types, interactions, colors, empty states, responsive behavior. For data: aggregation level, edge cases, derived fields. For narrative: tone, depth, structure, priority insights.

Present gray areas with options. Let user pick which to discuss. For each: ask 2-4 focused questions, capture the decision, check in, move to next. Don't ask about implementation details — ask about what they want to see.

Save to `docs/specs/SPEC-NNN-context.md` with: Scope Anchor, Locked Decisions, Claude's Discretion, Deferred Ideas, References. Commit with message "discuss: lock decisions for SPEC-NNN".

Scope guardrail: if a decision belongs to a different spec, capture under Deferred Ideas. Locked means locked — implementation must respect it.

$ARGUMENTS
