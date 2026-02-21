# AI Process Page Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the AI Process page from static documentation into a narrative story with an interactive 7-stage walkthrough tracing SPEC-005 through the full engineering pipeline.

**Architecture:** Expand the pipeline from 5 to 7 stages (add Discuss + Ship). Create a new `PipelineWalkthrough` client component with side-by-side layout (stage list left, content right). Merge artifact evidence into the walkthrough. Rewrite page.tsx with new opening/closing narrative copy. Remove the standalone `ArtifactEvidence` component.

**Tech Stack:** React (client component with useState), Tailwind CSS, existing shadcn/ui Card components, lucide-react icons.

**Design doc:** `docs/plans/2026-02-20-process-page-design.md`

---

### Task 1: Expand PipelineFlow to 7 Stages

**Files:**

- Modify: `src/components/process/pipeline-flow.tsx` (full rewrite of `stages` array)

**Step 1: Update the stages array**

Replace the 5-stage array with 7 stages. Redistribute the teal gradient across 7 stops. Add "Discuss" after Research and "Ship" after Verify.

```tsx
const stages = [
  {
    number: 1,
    name: 'Research',
    description:
      'Data profiling, EDA, 69 pytest contracts. Codify every finding into CLAUDE.md before writing a single spec.',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    circle: 'bg-teal-100 text-teal-700',
    arrow: 'text-teal-300',
  },
  {
    number: 2,
    name: 'Discuss',
    description:
      'Lock design decisions before specs exist. Narrow the solution space so AI can\u2019t wander into arbitrary choices.',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    circle: 'bg-teal-200 text-teal-800',
    arrow: 'text-teal-300',
  },
  {
    number: 3,
    name: 'Spec',
    description:
      'Behavior contracts with measurable acceptance criteria. Every feature starts as a written spec before code exists.',
    bg: 'bg-teal-100/60',
    border: 'border-teal-300',
    circle: 'bg-teal-300 text-teal-900',
    arrow: 'text-teal-400',
  },
  {
    number: 4,
    name: 'Spec-Check',
    description:
      'Readiness gate. Tighten subjective ACs into testable ones. Nothing proceeds to code until the spec passes.',
    bg: 'bg-teal-100',
    border: 'border-teal-300',
    circle: 'bg-teal-400 text-white',
    arrow: 'text-teal-400',
  },
  {
    number: 5,
    name: 'Implement',
    description:
      'Dual-machine build. The machine that writes code is separate from the machine that wrote the spec.',
    bg: 'bg-teal-200/60',
    border: 'border-teal-400',
    circle: 'bg-teal-500 text-white',
    arrow: 'text-teal-500',
  },
  {
    number: 6,
    name: 'Verify',
    description:
      'Goal-backward testing. Every AC checked individually with evidence. Fresh context window, no familiarity bias.',
    bg: 'bg-teal-200',
    border: 'border-teal-400',
    circle: 'bg-teal-600 text-white',
    arrow: 'text-teal-500',
  },
  {
    number: 7,
    name: 'Ship',
    description:
      'Session log, checkpoint, context persists. Every session\u2019s output becomes the next session\u2019s input.',
    bg: 'bg-teal-300/60',
    border: 'border-teal-500',
    circle: 'bg-teal-700 text-white',
    arrow: '',
  },
];
```

Also reduce `min-w` values from `200px`/`180px` to `160px`/`140px` to fit 7 cards across:

```tsx
// Change in the card div className:
// min-w-[200px] → min-w-[160px]
// md:min-w-[180px] → md:min-w-[140px]
```

**Step 2: Build verification**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds with no errors.

**Step 3: Commit**

```bash
git add src/components/process/pipeline-flow.tsx
git commit -m "feat(process): expand pipeline from 5 to 7 stages"
```

---

### Task 2: Create PipelineWalkthrough Component

**Files:**

- Create: `src/components/process/pipeline-walkthrough.tsx`

**Step 1: Create the walkthrough component**

This is a `'use client'` component with `useState` for the active stage index. It contains:

- The `STAGES` data array with all 7 stages' narrative content (principle, moment, artifact, callout)
- A `CodeExcerpt` helper (moved from artifact-evidence.tsx)
- The side-by-side layout (left stage list, right content panel)
- Responsive: on mobile (below `md`), stages become horizontal scrollable tabs above content

Key layout classes:

- Outer: `flex flex-col md:flex-row gap-0 md:gap-6`
- Left column: `flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible md:w-[200px] shrink-0`
- Right column: `flex-1 min-w-0`

Left column stage buttons:

- Active: `bg-teal-50 border-teal-300 text-teal-900 font-semibold` with filled teal circle
- Inactive: `bg-transparent border-transparent text-muted-foreground hover:bg-muted/50` with muted circle

Right column content per stage:

- Principle: `<p className="text-base font-semibold leading-snug">` (bold, larger)
- Moment: `<p className="text-muted-foreground text-sm leading-relaxed mt-3">` (narrative)
- Artifact: rendered inline (CodeExcerpt, before/after grid, or table — varies by stage)
- Callout: `<p className="text-muted-foreground text-sm italic mt-4 border-t pt-3">`

**Stage content data** (exact text from design doc — see `docs/plans/2026-02-20-process-page-design.md` for full narratives):

Stage 1 (Research) artifact — CLAUDE.md excerpt:

```
ANOMALY 2: Kansas August Batch Reversal (HIGH CONFIDENCE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KS August: 6,029 rows, 81.6% reversal rate (4,921 reversed)
Root cause: 18 KS-only groups (400xxx prefix) have 100%
reversal / zero incurred in August.

Pattern: Normal claims in July (~10% reversal), then 100%
reversal in August (zero new incurred), then re-incur in
September at ~1.4x normal volume. Classic batch reversal
+ rebill event.
```

Stage 2 (Discuss) artifact — SPEC-006-context.md excerpt:

```
SPEC-006 Context — Locked Decisions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Pipeline: CSS cards, consulting-deck aesthetic
2. Color: Teal gradient, light-to-dark left-to-right
3. Artifacts: Monospace in card wrappers (.md aesthetic)
4. Density: Full scroll, all visible, no accordions
5. Limitations: Amber border = confident self-awareness
```

Stage 3 (Spec) artifact — reuse existing SPEC-005 excerpt (same as current ArtifactSpec).

Stage 4 (Spec-Check) artifact — reuse existing before/after grid (same as current ArtifactSpecCheck).

Stage 5 (Implement) artifact — reuse existing dual-machine table (same as current ArtifactDualMachine).

Stage 6 (Verify) artifact — reuse existing PASS 17/17 report (same as current ArtifactVerification).

Stage 7 (Ship) artifact — session log excerpt:

```
Session Log — 2026-02-19 (Evening, Mac)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Accomplishments:
  ✓ SPEC-003 fixed (7 items) → READY
  ✓ SPEC-004 fixed (7 items) → READY
  ✓ Compliance audit — 3 gaps identified
  ✓ Strategic planning — 5 extension mock-ups

Next Steps:
  1. Verify SPEC-001 — /verify 001 on Mac
  2. Framework starts SPEC-002
  3. Saturday: write Anomalies spec
```

**Step 2: Build verification**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds. (Component not yet imported — just verifying it compiles.)

**Step 3: Commit**

```bash
git add src/components/process/pipeline-walkthrough.tsx
git commit -m "feat(process): add interactive PipelineWalkthrough component"
```

---

### Task 3: Rewrite page.tsx

**Files:**

- Modify: `src/app/process/page.tsx` (full rewrite)

**Step 1: Rewrite the page**

New structure:

1. Remove `ArtifactEvidence` import, add `PipelineWalkthrough` import
2. Rewrite header: new headline, subline, teal accent bar
3. Rewrite hook paragraph (from design doc)
4. Keep StatBar as-is
5. The System section: PipelineFlow + transition sentence + PipelineWalkthrough (replaces ContextLayer here — ContextLayer moves below)
6. Context Layer section (moved after walkthrough, with new transition sentence)
7. Toolkit section (unchanged)
8. Limitations section (unchanged, keep intro line)
9. New closing section with forward-looking paragraph

Full replacement for `page.tsx`:

```tsx
import { StatBar } from '@/components/process/stat-bar';
import { PipelineFlow } from '@/components/process/pipeline-flow';
import { PipelineWalkthrough } from '@/components/process/pipeline-walkthrough';
import { ContextLayer } from '@/components/process/context-layer';
import { Toolkit } from '@/components/process/toolkit';
import { Limitations } from '@/components/process/limitations';

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
      {children}
    </h2>
  );
}

export default function ProcessPage() {
  return (
    <div className="stagger-children space-y-8 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          How One Person With a System Built This in Four Days
        </h1>
        <p className="text-muted-foreground text-sm">
          Not lucky prompts. An engineering discipline that makes AI output reliable, verifiable,
          and repeatable.
        </p>
        <div className="mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-teal-400 to-teal-600" />
      </div>

      {/* Section 1: Hero Stat Bar + Hook */}
      <section className="space-y-4">
        <StatBar />
        <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
          Four anomalies in 596,000 rows of claims data. One was an easter egg &mdash; a test drug
          called Kryptonite&nbsp;XR injected by whoever built this dataset. Three required
          cross-dimensional analysis: an entire state&rsquo;s claims batch-reversed in a single
          month, a 41% volume spike with no identifiable cause, and a month with half the expected
          volume. The dashboard on the other three pages visualizes those findings. This page
          documents the system that made finding them inevitable &mdash; not lucky, not manual, but
          engineered.
        </p>
      </section>

      {/* Section 2: The System */}
      <section className="space-y-6">
        <SectionHeader>The System</SectionHeader>

        {/* Pipeline overview */}
        <div className="overflow-x-auto">
          <PipelineFlow />
        </div>

        {/* Transition to walkthrough */}
        <div className="rounded-r border-l-4 border-teal-300 bg-teal-50/30 px-4 py-3">
          <p className="text-muted-foreground text-sm leading-relaxed italic">
            Every feature followed this pipeline. Click any stage below to see what it produced for
            SPEC-005 &mdash; the Anomalies &amp; Recommendations page.
          </p>
        </div>

        {/* Interactive walkthrough */}
        <PipelineWalkthrough />
      </section>

      {/* Section 3: Context Layer */}
      <section className="space-y-4 border-t pt-8">
        <SectionHeader>Context Layer</SectionHeader>
        <p className="text-muted-foreground text-sm leading-relaxed italic">
          The pipeline works because context persists &mdash; between stages, between sessions, and
          between machines.
        </p>
        <ContextLayer />
      </section>

      {/* Section 4: The Toolkit */}
      <section className="space-y-4 border-t pt-8">
        <SectionHeader>The Toolkit</SectionHeader>
        <Toolkit />
      </section>

      {/* Section 5: Honest Limitations */}
      <section className="space-y-4 border-t pt-8">
        <SectionHeader>Honest Limitations</SectionHeader>
        <p className="text-muted-foreground text-sm leading-relaxed italic">
          AI is a force multiplier, not a replacement. Here&rsquo;s where it needed guardrails.
        </p>
        <Limitations />
      </section>

      {/* Section 6: Closing */}
      <section className="border-t pt-8">
        <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
          This system isn&rsquo;t specific to claims data or pharmacy analytics. It&rsquo;s a
          framework for making AI output reliable in any analytical domain &mdash; structured
          research, measurable specs, gated implementation, goal-backward verification, and
          persistent context across sessions. The process is the product.
        </p>
      </section>
    </div>
  );
}
```

**Step 2: Build verification**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/process/page.tsx
git commit -m "feat(process): rewrite page with narrative arc and walkthrough"
```

---

### Task 4: Clean Up — Remove ArtifactEvidence

**Files:**

- Delete: `src/components/process/artifact-evidence.tsx`

**Step 1: Verify no other imports**

Run: `grep -r "artifact-evidence" src/` — should return zero results after Task 3 removed the import from page.tsx.

**Step 2: Delete the file**

```bash
rm src/components/process/artifact-evidence.tsx
```

**Step 3: Build verification**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add -u src/components/process/artifact-evidence.tsx
git commit -m "chore: remove ArtifactEvidence (absorbed into walkthrough)"
```

---

### Task 5: Visual QA + Final Commit

**Step 1: Start dev server if not running**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/process`
Expected: 200

**Step 2: Visual QA checklist**

Verify in browser at `http://localhost:3001/process`:

- [ ] Headline and hook paragraph render correctly
- [ ] Stat bar shows 5 stats with teal gradient
- [ ] Pipeline overview shows 7 stages with teal gradient, chevron connectors
- [ ] 7 stages fit horizontally on desktop without overflow
- [ ] Walkthrough: clicking each stage switches right-panel content
- [ ] All 7 stages have principle, narrative, artifact, and callout
- [ ] Before/after spec-check comparison renders (red/teal grid)
- [ ] Dual-machine table renders with header and 4 rows
- [ ] Verification report renders in monospace
- [ ] Context Layer section renders 3 cards
- [ ] Toolkit section unchanged
- [ ] Limitations section unchanged
- [ ] Closing paragraph renders
- [ ] Mobile responsive: stages become horizontal tabs on narrow viewport

**Step 3: Push**

```bash
git push origin main
```
