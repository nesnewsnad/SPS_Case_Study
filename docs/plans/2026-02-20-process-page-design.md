# AI Process Page Redesign — Design Document

**Date:** 2026-02-20
**Status:** APPROVED
**Goal:** Transform the AI Process page from documentation into a narrative story that demonstrates engineering rigor and positions the builder as someone who could lead an AI transformation.

---

## Narrative Arc

**Proof → System → Vision**

1. **Opening** — Lead with what we found (4 anomalies, including non-obvious ones) to establish stakes
2. **System** — Show the 7-stage pipeline that made the findings inevitable, with an interactive walkthrough tracing SPEC-005 through every stage
3. **Vision** — Close with forward-looking framing: this system is transferable to any analytical domain

---

## Page Structure

### Section 1: Opening (above the fold)

**Headline:** "How One Person With a System Built This in Four Days"
**Subline:** "Not lucky prompts. An engineering discipline that makes AI output reliable, verifiable, and repeatable."

**Stat Bar:** Same 5 stats (4 Build Days, 4 Anomalies, 5 Specs, ~65 ACs, ~8 Sessions). Same teal treatment. Earned credibility.

**Hook paragraph:**

> Four anomalies in 596,000 rows of claims data. One was an easter egg — a test drug called Kryptonite XR injected by whoever built this dataset. Three required cross-dimensional analysis: an entire state's claims batch-reversed in a single month, a 41% volume spike with no identifiable cause, and a month with half the expected volume. The dashboard on the other three pages visualizes those findings. This page documents the system that made finding them inevitable — not lucky, not manual, but engineered.

### Section 2: Pipeline Overview (visual)

The existing horizontal pipeline flow, expanded from 5 to **7 stages**:

```
① Research → ② Discuss → ③ Spec → ④ Spec-Check → ⑤ Implement → ⑥ Verify → ⑦ Ship
```

Same teal gradient progression (lightest at Research, darkest at Ship). Same numbered circles and ChevronRight connectors. Mobile: horizontal scroll with snap points.

**Below the pipeline, a transition sentence:**

> "Every feature followed this pipeline. Click any stage below to see what it produced for SPEC-005 — the Anomalies & Recommendations page."

### Section 3: Interactive Walkthrough (centerpiece)

**Layout:** Side-by-side. Left column = clickable stage list (always visible). Right column = content for active stage.

**Left column:**

- 7 stages listed vertically
- Active stage: teal background, filled circle, bold text
- Inactive stages: muted text, outline circle
- Click to switch stages
- Numbers match the pipeline overview above

**Right column per stage has 3 layers:**

1. **Principle** (1 bold sentence) — the transferable rule
2. **SPEC-005 Moment** (narrative paragraph) — what concretely happened
3. **Artifact** (code excerpt, table, or before/after comparison) — the real evidence
4. **Callout** (italic, muted) — the takeaway

#### Stage 1 — Research

- **Principle:** "Never build on assumptions. Build on verified data contracts."
- **Moment:** "Before a single chart was designed, we ran 69 pytest contracts against the raw data — confirming join coverage (99.5% NDC match), identifying the Kryptonite injection (49,567 synthetic claims concentrated in May), and isolating the Kansas August batch reversal pattern (18 groups, 100% reversal, zero incurred). These findings were codified into CLAUDE.md — the project's living memory — so that every subsequent AI session started with verified ground truth, not re-discovered assumptions."
- **Artifact:** Excerpt from CLAUDE.md showing the KS August anomaly writeup (real data, real finding)
- **Callout:** "Session 8 knew exactly what Session 1 discovered. That's not AI magic — that's an artifact chain."

#### Stage 2 — Discuss

- **Principle:** "Lock design decisions before writing specs. Ambiguity in design becomes ambiguity in code."
- **Moment:** "Before SPEC-005 was written, a discuss session locked 5 design decisions: consulting-deck aesthetic (not raw terminal output), teal gradient for the pipeline (reinforces directional flow), terminal/.md aesthetic for artifact evidence, full-scroll visibility (no accordions — the evaluator sees everything), and amber borders for honest limitations (confident self-awareness, not defensive). These decisions constrained the spec — the writer couldn't wander into arbitrary choices because the design space was already narrowed."
- **Artifact:** Excerpt from SPEC-006-context.md showing locked decisions with rationale
- **Callout:** "Design decisions locked in discuss sessions don't get relitigated during implementation. That's how you keep AI focused."

#### Stage 3 — Spec

- **Principle:** "If you can't write it as a testable acceptance criterion, you don't understand the requirement yet."
- **Moment:** "SPEC-005 defined 17 acceptance criteria for the Anomalies page. Not feature descriptions — testable contracts. AC 5 specified that mini-charts render dynamically from a typed data structure. AC 11 required each mock-up extension panel to contain 'at least one visual element beyond plain text.' The spec also declared dependencies (SPEC-001 API routes, SPEC-002 filter context) and defined the exact data shape each anomaly panel would consume. The implementation machine received a behavior contract, not a wish list."
- **Artifact:** Existing SPEC-005 code excerpt (AC 5, AC 11)
- **Callout:** "If you can't test it, you can't verify it. If you can't verify it, you're trusting luck."

#### Stage 4 — Spec-Check

- **Principle:** "A second pair of eyes before code exists catches the cheapest bugs in the project."
- **Moment:** "The spec-check reviewed all 17 ACs for testability. It caught AC 11's original wording — 'visual mock-up area is intentionally designed, not unfinished' — and flagged it as subjective. How does a verifier test 'intentionally designed'? The tightened version specified a concrete threshold: 'at least one visual element (chart wireframe, CSS shape, or structured layout) beyond plain text.' Two minutes of spec editing prevented an ambiguous verification later."
- **Artifact:** Existing before/after comparison (red "Before" → teal "After")
- **Callout:** "This is where AI discipline pays off. The spec-check caught what self-review missed."

#### Stage 5 — Implement

- **Principle:** "The machine that writes the code never wrote its own acceptance criteria."
- **Moment:** "Implementation ran on the Framework Desktop. The spec was written on the Mac. While Framework built the Anomalies page components — investigation panels, mini-charts, follow-up questions — the Mac was already writing SPEC-006 (this page). Neither machine touched the other's work. Git was the coordination layer: push from Framework, pull on Mac, verify, push back. The commit log is the audit trail."
- **Artifact:** Existing dual-machine commit table (Mac Architect | Framework Builder)
- **Callout:** "Writer/reviewer separation isn't overhead — it's the reason the dashboard works."

#### Stage 6 — Verify

- **Principle:** "Goal-backward: start from the acceptance criteria and work backward to the running code."
- **Moment:** "Verification used a fresh AI context window — no memory of implementation decisions, no familiarity bias. Each of the 17 ACs was tested individually against the deployed application: Does AC 1 pass? Evidence. Does AC 2 pass? Evidence. The result: PASS 17/17. Not 'it looks good' — seventeen individual checks with documented evidence for each."
- **Artifact:** Existing PASS 17/17 verification report
- **Callout:** "PASS 17/17 means 17 individual tests passed. Not 'it looks fine.'"

#### Stage 7 — Ship

- **Principle:** "Every session's output becomes the next session's input. The process is cyclical, not linear."
- **Moment:** "After verification, a session log captured what was accomplished, what decisions were made, and what's next. The next morning's `/open-session` command reads that log automatically — the new AI context window starts with full continuity, not a cold start. Over 8+ sessions, zero context was lost. When context degraded mid-session, `.continue-here.md` checkpointed exact state: current task, decisions made, what's remaining. A new context window picked up exactly where the old one left off."
- **Artifact:** Excerpt from a real session log or .continue-here.md showing the continuity chain
- **Callout:** "Most people start every AI conversation from scratch. This system never does."

### Section 4: Context Layer

Stays largely as-is (CLAUDE.md, Session Logs, .continue-here.md cards). Add a transition sentence:

> "The pipeline works because context persists — between stages, between sessions, and between machines."

### Section 5: The Toolkit

Stays as-is. Enterprise framing paragraph, Streamlit contrast callout, 6 tool cards.

### Section 6: Honest Limitations

Stays as-is. 4 amber-bordered limitation cards. Add intro:

> "AI is a force multiplier, not a replacement. Here's where it needed guardrails."

### Section 7: Closing (new)

A brief forward-looking paragraph:

> "This system isn't specific to claims data or pharmacy analytics. It's a framework for making AI output reliable in any analytical domain — structured research, measurable specs, gated implementation, goal-backward verification, and persistent context across sessions. The process is the product."

---

## Technical Implementation Notes

### New Component: `PipelineWalkthrough`

- Client component with `useState` for active stage index
- Left column: `<button>` per stage, conditionally styled
- Right column: renders content based on active stage
- Responsive: on mobile, left column becomes horizontal scrollable tabs above content
- Replaces the current `ArtifactEvidence` component (artifacts are now inside the walkthrough)

### Modified Components

- `PipelineFlow` — expand from 5 to 7 stages
- `page.tsx` — restructure sections, add opening/closing copy, swap ArtifactEvidence for PipelineWalkthrough
- `StatBar` — no changes needed

### Components That Stay As-Is

- `ContextLayer`
- `Toolkit`
- `Limitations`

### Components Removed

- `ArtifactEvidence` — absorbed into PipelineWalkthrough

---

## Design Decisions

| Decision                  | Choice                                                                 | Rationale                                                                                 |
| ------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Walkthrough UX            | Side-by-side (stages left, content right)                              | Mirrors the dashboard's own interaction model. Non-linear access for busy evaluators.     |
| Number of stages          | 7 (Research → Discuss → Spec → Spec-Check → Implement → Verify → Ship) | Reflects the actual process, not a simplified version. More stages = more proof of rigor. |
| Story protagonist         | SPEC-005 (Anomalies & Recommendations)                                 | Most analytically impressive feature. Has real artifacts at every stage.                  |
| Narrative structure       | Principle + SPEC-005 Moment + Artifact + Callout                       | Three layers: transferable rule, concrete proof, real evidence.                           |
| Artifact Evidence section | Merged into walkthrough                                                | Artifacts are proof inside the system, not an appendix after it.                          |
| Mobile treatment          | Stages as horizontal tabs above content                                | Maintains side-by-side mental model in constrained space.                                 |
