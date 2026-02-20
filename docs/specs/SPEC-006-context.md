# SPEC-006 Context — AI Process Page

**Date:** 2026-02-20
**Spec:** SPEC-006-ai-process.md

---

## Scope Anchor

The AI Process page (`/process`) — a fully static page documenting how AI was used to build this dashboard. Scores on the "AI Proficiency" axis. Five sections: hero/hook, the system (pipeline + context layer), artifact evidence, toolkit, honest limitations.

---

## Locked Decisions

1. **Pipeline visualization**: CSS cards with arrow connectors, consulting-deck aesthetic. Horizontal row of rectangular cards with thin lines or chevron arrows between stages. Professional, room for 2-3 line descriptions per stage.

2. **Color system for pipeline stages**: Teal gradient progression, light-to-dark left-to-right (e.g., teal-100 → teal-600). Reinforces the left-to-right flow and "each stage builds on the last." Single color family, no rainbow.

3. **Artifact excerpt styling**: Styled document cards — Card component wrapper matching dashboard design language, but inner excerpt content uses monospace/terminal font (`font-mono`) with muted text color on a subtle background. The `.md`-in-a-terminal aesthetic. Not raw dark-background code blocks, not plain text.

4. **Page density**: Full scroll, all sections visible. No accordions, no tabs, no collapsed content. Visual hierarchy (hero → big pipeline → evidence → compact toolkit → short limitations) manages pacing naturally. Evaluators shouldn't have to click to see the process.

5. **Limitation card tone**: Amber left-border accent treatment. Subtle warm tint that reads as "intentional transparency" — like a documentation "note" callout. Not neutral (too forgettable), not muted/buried (looks defensive). Confident self-awareness.

---

## Claude's Discretion

- Exact teal gradient values (teal-100 through teal-600 is directional, not prescriptive)
- Arrow connector style (SVG lines, CSS borders, chevron characters — whatever looks cleanest)
- Card padding, spacing, font sizes — follow existing dashboard conventions
- Whether stat bar uses the existing KpiCard component or a simpler custom pill
- Component file organization (fewer files is fine for a static page)
- Whether to use a `<Separator />` or spacing between sections

---

## Deferred Ideas

- Linking to the actual git repo from the page (user will share repo access separately)
- Interactive pipeline diagram with click-to-expand stages
- Live commit counts or dynamic stats pulled from git
- Animated transitions between sections

---

## References

- Consulting-deck process diagrams for pipeline visual style
- Terminal/editor `.md` rendering for artifact excerpt aesthetic
- Documentation "note" callout pattern (amber left border) for limitation cards
