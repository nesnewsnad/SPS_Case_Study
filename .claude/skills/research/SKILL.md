---
name: research
description: Lightweight research phase — investigate before writing a spec
---

# Research

Usage: `/research` (for next TODO item) or `/research SPEC-003` (for a specific upcoming spec)

Inspired by GSD's research phase. Run AFTER `/discuss` and BEFORE writing the spec.

## Purpose

Investigate what you need to know to write a good spec. Don't guess — look.

## Workflow

1. **Load context**: Read the TODO item, CONTEXT doc (from `/discuss`), and CLAUDE.md

2. **Identify research questions**: What do we need to know? Categories:

   **Data questions** (answer from the actual data):
   - What are the actual value distributions for fields we'll visualize?
   - What are the cardinalities? (e.g., how many unique drug names — 10 or 10,000?)
   - What edge cases exist? (nulls, outliers, unexpected values)
   - What does the merged dataset actually look like?

   **Technical questions** (answer from docs/web):
   - Can Chart.js do what we need? (specific interaction patterns)
   - What's the best chart type for this data shape?
   - Performance considerations for embedding large datasets in HTML?
   - Browser compatibility for features we're planning?

   **Domain questions** (answer from industry knowledge):
   - What KPIs matter in LTC pharmacy analysis?
   - What's a normal reversal rate?
   - What does MONY distribution tell a pharmacy analyst?
   - What would SPS Health's team actually want to see?

3. **Investigate**: Run queries, search the web, analyze the data. For each question:
   - State the question
   - Show the evidence
   - State the finding
   - Rate confidence: HIGH (verified from data/docs) / MEDIUM (reasonable inference) / LOW (educated guess)

4. **Write research doc**: Save to `docs/specs/SPEC-NNN-research.md` with:
   - **Questions Investigated**
   - **Findings** (with confidence levels)
   - **Implications for Spec** (how findings should shape the spec)
   - **Open Questions** (things we still don't know)

5. Commit:
   ```bash
   git add docs/specs/SPEC-NNN-research.md && git commit -m "research: findings for SPEC-NNN"
   ```

## Rules

- **Evidence over opinion**: "The data shows X" not "I think X"
- **Confidence ratings are honest**: LOW is fine — it flags where we're guessing
- **Data questions answered from data**: Don't guess cardinalities — count them
- **Keep it focused**: Research what the spec needs, not everything interesting
- **Claude's training data is hypothesis, not fact**: Verify claims about Chart.js capabilities, industry benchmarks, etc. against current docs
