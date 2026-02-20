# SPEC-006 — AI Process Page

**Date:** 2026-02-20
**Status:** READY
**Dependencies:** None (fully static page, no API)
**Context:** Case study brief deliverable #4 (AI Process Documentation); scoring axis #1 (AI Proficiency)

---

## Problem

The AI Process page is where we score on "AI Proficiency" — the first of three scoring axes. The current page is a static placeholder with empty cards. This spec turns it into a compelling, evidence-backed narrative that demonstrates not just AI usage, but a professional AI-augmented engineering workflow.

The page answers one question: **"How did one person build a production analytics platform in four days?"**

This is a fully static page — no API calls, no filters, no dynamic data. All content is hardcoded in JSX. The value is in the narrative structure and visual presentation.

---

## Behavior

### Page Structure

```
┌──────────────────────────────────────────────────────────────┐
│ Page Header                                                   │
│ "AI Process"                                                  │
│ "How one person with a system built a production analytics    │
│  platform in four days."                                      │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ SECTION 1: Hero Stat Bar + Framing                         │ │
│ │  [4 Days] [4 Anomalies] [5 Specs] [~65 ACs] [~8 Sessions] │ │
│ │  Framing paragraph                                         │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ SECTION 2: The System                                      │ │
│ │  Pipeline flow (5 stages) + Context management layer       │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ SECTION 3: Artifact Evidence                               │ │
│ │  4 proof cards, one per pipeline stage                     │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ SECTION 4: The Toolkit                                     │ │
│ │  Enterprise framing + 6 compact tool cards                 │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ SECTION 5: Honest Limitations                              │ │
│ │  4 candid limitation cards                                 │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

### Page Header

- Title: **"AI Process"** (text-2xl font-semibold)
- Subtitle: **"How one person with a system built a production analytics platform in four days."** (text-muted-foreground)
- No FilterBar on this page

### Tone

First-person practitioner voice. Direct, confident, conversational. Let the artifacts speak — minimal prose, heavy on labeled visuals with short callouts.

---

## Section 1: Hero Stat Bar + Framing

### Stat Bar

A horizontal row of 5 compact stat pills/badges (styled similar to KPI cards on Overview but smaller — single row):

| Value   | Label                         |
| ------- | ----------------------------- |
| **4**   | Build Days                    |
| **4**   | Anomalies Detected            |
| **5**   | Specs Written                 |
| **~65** | Acceptance Criteria           |
| **~8**  | Sessions with Full Continuity |

Values are hardcoded. Approximate is fine — the point is scale-at-a-glance.

### Framing Paragraph

Below the stat bar, one paragraph in first person:

> "Four anomalies in 596,000 rows of claims data. Two are obvious — a test drug called Kryptonite XR isn't hard to spot. Two require cross-dimensional analysis that most manual reviews miss. All four were found by the same structured AI workflow — not lucky prompts, but an engineering system designed for repeatability, context preservation, and verification. This page documents that system."

---

## Section 2: The System

This is the centerpiece of the page (~60% of visual weight).

### Pipeline Flow

A horizontal pipeline (desktop) showing 5 stages connected by arrows. Each stage is a card with:

- **Stage number** in a small colored circle
- **Stage name** (bold)
- **2-3 line description** of what happens at this stage

The 5 stages:

**1 → Research**
EDA, data profiling, discovery. 69 pytest data contracts codifying findings. Feed everything into CLAUDE.md.

**2 → Spec**
Problem statement, behavior definition, measurable acceptance criteria. Every feature starts as a written spec before code exists.

**3 → Spec-Check**
Readiness review. Tighten subjective ACs into testable ones. Add implementor notes for ambiguous areas. Gate: nothing proceeds to code until the spec passes.

**4 → Implement**
Dual-machine architecture. The machine that writes the code (Framework) is separate from the machine that wrote the spec (Mac). Writer never verifies their own work.

**5 → Verify**
Goal-backward verification. Every AC tested individually with evidence. "PASS 17/17" means 17 individual checks, not "it looks right."

Below the pipeline, a single line:

> "Every feature followed this pipeline. No exceptions. The discipline is the point — it's what makes AI output reliable instead of lucky."

### Context Management Layer

A secondary row of 3 cards below the pipeline, labeled **"Context Layer — how AI remembers across sessions"**:

**CLAUDE.md**
Living project brain. Data findings, architecture decisions, schema, anomaly writeups — AI reads this every session. Single source of truth that grows with the project.

**Session Logs**
Every session opens by reading the last session log. Every session closes by writing one. Accomplishments, decisions, next steps. AI never starts cold.

**.continue-here.md**
Mid-session state capture. When context degrades or you switch tasks, checkpoint everything — current state, decisions made, what's remaining. A new AI context window picks up exactly where you left off.

---

## Section 3: Artifact Evidence

Four cards in a vertical stack. Each card proves a different pipeline stage is real, not theoretical. Each card has:

- **Stage badge** (small, colored, matching pipeline)
- **Artifact title**
- **The actual excerpt** in a monospace/code block or styled quote block
- **A one-line callout** in italic below explaining what to notice

### Artifact 1: The Spec

**Badge:** Stage 2 — Spec
**Title:** "What a real AI-driven spec looks like"

Show SPEC-005 header (title, date, status, dependencies line) + 2-3 sample ACs:

```
SPEC-005 — Anomalies & Recommendations Page
Date: 2026-02-20 | Status: READY | Dependencies: SPEC-001, SPEC-002

AC 5:  Mini charts render dynamically from panel.miniCharts[] —
       bar charts for type: 'bar', grouped bars for type: 'grouped-bar'

AC 11: Each mock-up visual contains at least one visual element
       (chart wireframe, CSS shape, or structured layout) beyond
       plain text — not a solid-color empty div
```

**Callout:** _"Every AC is testable. 'Looks good' is not an acceptance criterion."_

### Artifact 2: The Spec-Check

**Badge:** Stage 3 — Spec-Check
**Title:** "What the review loop catches"

Show a before/after comparison (use a small two-column table or side-by-side blocks):

| Before Spec-Check                                               | After Spec-Check                                                                                            |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| "Visual mock-up area is intentionally designed, not unfinished" | "Contains at least one visual element (chart wireframe, CSS shape, or structured layout) beyond plain text" |

**Callout:** _"Subjective → measurable. The spec-check caught this before a single line of code was written."_

### Artifact 3: Dual-Machine Implementation

**Badge:** Stage 4 — Implement
**Title:** "The machine that writes the code doesn't verify it"

Show a two-column mini commit log:

| Mac (Architect)                    | Framework (Builder)                             |
| ---------------------------------- | ----------------------------------------------- |
| write SPEC-003: Executive Overview | implement SPEC-003: KPIs, charts, insight cards |
| verify SPEC-003: PASS 15/15 ACs    | implement SPEC-004: drugs table, days supply    |
| write SPEC-005: Anomalies          | implement SPEC-004: top groups, manufacturers   |
| spec-check SPEC-005: tighten AC 11 | —                                               |

**Callout:** _"Separation of concerns. The architect never touches implementation. The builder never writes its own acceptance criteria."_

### Artifact 4: Verification Report

**Badge:** Stage 5 — Verify
**Title:** "PASS means every AC tested"

Show a condensed verification output in monospace:

```
SPEC-004 Verification — Claims Explorer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AC 1:  ✓  Page renders at /explorer, fetches /api/claims
AC 2:  ✓  FilterBar present with all dimensions
AC 3:  ✓  Mini trend chart with incurred/reversed
...
AC 17: ✓  No horizontal overflow, text readable
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Result: PASS (17/17)
```

**Callout:** _"Not 'it looks right.' Every acceptance criterion, individually tested, with evidence."_

---

## Section 4: The Toolkit

### Header Statement

> "This isn't a prototype. The stack was chosen to be deployable today — Vercel for zero-config production hosting, Postgres for real relational data at scale, Next.js for the same framework Fortune 500 companies ship on. Multi-entity architecture is already in the schema. Onboarding Pharmacy B is a CSV upload, not a rebuild. Every tool was also chosen for AI compatibility — lightweight, well-documented, and predictable enough that AI-generated code works on the first pass."

### Contrast Callout

A subtle callout card or blockquote below the header, before the tool grid:

> **Why not Streamlit or static HTML?** A notebook or single HTML file works for one-time analysis. It doesn't work for a second client, a second analyst, or a Monday morning deploy. We chose the stack a real engineering team would inherit — server-side aggregation so raw data never hits the browser, typed API contracts so the frontend and backend can evolve independently, and a deployment pipeline that ships preview URLs on every git push.

### Tool Grid

6 compact cards in a 3×2 or 2×3 grid. Each card has:

- **Tool name** (bold)
- **Role in this project** (2-3 sentences — not what the tool _is_, but what it _did here_ and why it was chosen for an AI workflow)

| Tool                | Role                                                                                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Claude Code CLI** | Primary AI partner. Specs, implementation, verification — all through the CLI. Not a chat window — a terminal-native workflow that reads project files, writes code, and runs tests.         |
| **Next.js 14**      | App Router, server components, API routes. Zero-config deployment to Vercel. The same framework used in production by companies at scale.                                                    |
| **Vercel Postgres** | Neon-backed, production-grade. Multi-entity schema from day one. 596K claims and 247K drug records seeded and queried live.                                                                  |
| **Drizzle ORM**     | Type-safe, SQL-close. AI writes better Drizzle than heavy ORMs — less abstraction means fewer hallucinated methods.                                                                          |
| **Recharts**        | Every chart in the dashboard. React-native, composable. AI generates reliable chart configs because the API surface is predictable.                                                          |
| **shadcn/ui**       | Production-grade components without a design system. Consistent visual language across 4 dashboard views. Copy-paste architecture means AI can compose components without framework lock-in. |

---

## Section 5: Honest Limitations

### Header

> "AI is a force multiplier, not a replacement. Here's where it needed guardrails."

### Limitation Cards

4 cards in a vertical stack or 2×2 grid. Each card has a bold title and 2-3 sentences. No spin — state the limitation, then state what was done about it as a matter of fact.

**Context Window is Real**
AI loses coherence on long sessions. That's why session logs and .continue-here.md exist — not because the workflow is elegant, but because without them, session #8 has no idea what session #1 decided.

**AI Doesn't Know When It's Wrong**
It will confidently generate a chart that looks right with wrong data. Writer/reviewer separation exists because self-review doesn't catch what fresh-context review catches.

**Domain Knowledge is Borrowed**
I'm not a PBM analyst. AI helped me speak the language — MONY codes, NDC joins, LTC cycle fills — but every finding was verified against the raw data, not trusted from a prompt.

**The Process Has Overhead**
Writing specs for a 4-day project feels like overkill. It's not. Two bugs were caught at spec-check that would have taken longer to fix in code than to prevent on paper.

---

## File Structure

```
src/
  app/
    process/
      page.tsx                    # AI Process page (replaces placeholder)
  components/
    process/
      stat-bar.tsx                # Hero stat pills
      pipeline-flow.tsx           # 5-stage pipeline visualization
      context-layer.tsx           # 3 context management cards
      artifact-card.tsx           # Reusable evidence card
      tool-card.tsx               # Reusable toolkit card
      limitation-card.tsx         # Reusable limitation card
```

Component organization at implementor's discretion. Fewer files is fine — the page is static content, not complex state management.

---

## Implementor Notes

1. **Fully static page** — no `useState`, no `useEffect`, no API calls. Just JSX. Can be a server component (no `'use client'` needed) unless dynamic imports are used for visual elements.

2. **Pipeline visualization** — CSS flexbox/grid with styled cards and SVG or CSS arrows. Does not need to be a library-rendered diagram. Keep it simple — the visual clarity matters more than animation.

3. **Monospace excerpts** — use `<pre>` or a styled code block for artifact content. Match the monospace aesthetic of a terminal/editor — this reinforces the "real engineering" message.

4. **Stat bar values are approximate** — hardcode them. Don't compute from actual files. The hero stat bar communicates scale, not precision.

5. **All text content is defined inline** — no separate data file. The artifact excerpts, limitation descriptions, tool descriptions, and framing paragraphs are all static strings in JSX.

6. **Existing placeholder** at `src/app/process/page.tsx` — replace entirely.

7. **Design decisions are locked** — reference `docs/specs/SPEC-006-context.md` for non-negotiable decisions: CSS cards with arrow connectors (consulting-deck style), teal gradient progression, `font-mono` document cards for artifact excerpts, full scroll (no hidden content), amber left-border on limitation cards.

---

## Acceptance Criteria

1. AI Process page at `/process` renders all 5 sections (hero, system, evidence, toolkit, limitations)
2. Page has no FilterBar, no API calls — fully static content
3. Hero stat bar displays 5 metrics in a horizontal row with labels
4. Framing paragraph renders below stat bar, contains first-person pronouns, and matches the text specified in the Behavior section
5. Pipeline flow renders 5 stages with visible connector elements (arrows or lines) between each stage, using a teal gradient progression (lighter on left, darker on right)
6. Context management layer renders 3 cards (CLAUDE.md, Session Logs, .continue-here.md) below the pipeline
7. Four artifact evidence cards render, each with stage badge, title, excerpt in monospace/code style, and italic callout
8. Artifact 2 (spec-check) shows a before/after comparison
9. Artifact 3 (dual-machine) shows a two-column commit log layout
10. Toolkit section has enterprise framing paragraph, Streamlit/HTML contrast callout, and 6 tool cards
11. Each tool card describes the tool's role in this project, not a generic description
12. Honest Limitations section has 4 cards with amber/warm left-border accent and candid, no-spin descriptions
13. Page is scrollable, no horizontal overflow, all text readable without truncation
14. The System section (pipeline + context layer) occupies more vertical space than any other individual section

---

## Non-Goals

- API calls or dynamic data
- FilterBar or FilterContext
- Interactive elements beyond scrolling
- Animated pipeline diagram (static is fine)
- Dark mode
- Mobile/responsive layout
- Links to external tools or documentation
- Git repo integration or live commit counts
