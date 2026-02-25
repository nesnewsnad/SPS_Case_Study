---
name: discuss
description: Pre-spec design conversation — identify gray areas and lock decisions
---

# Discuss

Usage: `/discuss` (for next TODO item) or `/discuss SPEC-003` (for a specific upcoming spec)

Inspired by GSD's discuss-phase workflow. Run BEFORE writing a spec to capture design decisions.

## Purpose

Your roadmap (TODO.md) has a sentence or two per item. That's not enough context to write a good spec. This step identifies gray areas — decisions that would change the outcome — and locks them before spec writing begins.

## Workflow

1. **Load context**: Read the TODO item description, CLAUDE.md for project context, and any existing CONTEXT docs

2. **Identify gray areas**: Based on what's being built, surface the decisions that matter:

   For **visual/dashboard features**:
   - Layout (grid vs. tabs vs. scrolling sections)
   - Chart types (bar vs. line vs. area, stacked vs. grouped)
   - Interaction patterns (click-to-filter, hover tooltips, drill-down behavior)
   - Color palette and visual hierarchy
   - Empty states (what shows when filters return no data)
   - Mobile/responsive behavior

   For **data processing**:
   - Aggregation level (daily, weekly, monthly)
   - How to handle edge cases (null values, unmatched NDCs)
   - Derived field calculations
   - Performance considerations for large datasets

   For **narrative/content**:
   - Tone (clinical vs. business vs. conversational)
   - Depth (executive summary vs. detailed analysis)
   - Structure (story arc, section flow)
   - What insights to prioritize

3. **Present gray areas**: List 3-6 decision points with options for each. Let the user pick which to discuss.

4. **Discussion loop**: For each selected area:
   - Ask 2-4 focused questions
   - Capture the decision
   - Check: "Anything else on this area?"
   - Move to next

5. **Write CONTEXT doc**: Save to `docs/specs/SPEC-NNN-context.md` with:
   - **Scope Anchor**: what this spec covers (from TODO)
   - **Locked Decisions**: user's choices, non-negotiable in implementation
   - **Claude's Discretion**: areas where any reasonable choice is fine
   - **Deferred Ideas**: good ideas that belong in a different spec
   - **References**: "I want it like X" examples the user mentioned

6. Commit:
   ```bash
   git add docs/specs/SPEC-NNN-context.md && git commit -m "discuss: lock decisions for SPEC-NNN"
   ```

## Rules

- **Scope guardrail**: If a decision belongs to a different spec, capture it under Deferred Ideas, don't discuss it now
- **Don't ask about implementation details**: "Which Chart.js method?" is wrong. "Bar chart or line chart for monthly trends?" is right.
- **User = visionary, Claude = builder**: Ask about what they want to see, not how to code it
- **4 questions max per area, then check in**: Don't interrogate
- **Locked means locked**: Once a decision is in CONTEXT, implementation must respect it
