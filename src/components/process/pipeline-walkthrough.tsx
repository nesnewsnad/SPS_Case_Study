'use client';

import { useState } from 'react';

/* ── Monospace excerpt block ── */
function CodeExcerpt({ children }: { children: string }) {
  return (
    <div className="bg-muted/50 rounded-md border p-4">
      <pre className="text-muted-foreground font-mono text-xs leading-relaxed whitespace-pre-wrap">
        {children}
      </pre>
    </div>
  );
}

/* ── Stage content data ── */
const STAGES = [
  {
    number: 1,
    name: 'Research',
    principle: 'Never build on assumptions. Build on verified data contracts.',
    moment:
      'Before a single chart was designed, we ran 69 pytest contracts against the raw data \u2014 confirming join coverage (99.5% NDC match), identifying the Kryptonite injection (49,567 synthetic claims concentrated in May), and isolating the Kansas August batch reversal pattern (18 groups, 100% reversal, zero incurred). These findings were codified into CLAUDE.md \u2014 the project\u2019s living memory \u2014 so that every subsequent AI session started with verified ground truth, not re-discovered assumptions.',
    artifact: 'code' as const,
    artifactContent: `ANOMALY 2: Kansas August Batch Reversal (HIGH CONFIDENCE)
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
KS August: 6,029 rows, 81.6% reversal rate (4,921 reversed)
Root cause: 18 KS-only groups (400xxx prefix) have 100%
reversal / zero incurred in August.

Pattern: Normal claims in July (~10% reversal), then 100%
reversal in August (zero new incurred), then re-incur in
September at ~1.4x normal volume. Classic batch reversal
+ rebill event.`,
    callout:
      'Session 8 knew exactly what Session 1 discovered. That\u2019s not AI magic \u2014 that\u2019s an artifact chain.',
  },
  {
    number: 2,
    name: 'Discuss',
    principle:
      'Lock design decisions before writing specs. Ambiguity in design becomes ambiguity in code.',
    moment:
      'Before SPEC-005 was written, a discuss session locked 5 design decisions: consulting-deck aesthetic (not raw terminal output), teal gradient for the pipeline (reinforces directional flow), terminal/.md aesthetic for artifact evidence, full-scroll visibility (no accordions \u2014 the evaluator sees everything), and amber borders for honest limitations (confident self-awareness, not defensive). These decisions constrained the spec \u2014 the writer couldn\u2019t wander into arbitrary choices because the design space was already narrowed.',
    artifact: 'code' as const,
    artifactContent: `SPEC-006 Context \u2014 Locked Decisions
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
1. Pipeline: CSS cards, consulting-deck aesthetic
2. Color: Teal gradient, light-to-dark left-to-right
3. Artifacts: Monospace in card wrappers (.md aesthetic)
4. Density: Full scroll, all visible, no accordions
5. Limitations: Amber border = confident self-awareness`,
    callout:
      'Design decisions locked in discuss sessions don\u2019t get relitigated during implementation. That\u2019s how you keep AI focused.',
  },
  {
    number: 3,
    name: 'Spec',
    principle:
      'If you can\u2019t write it as a testable acceptance criterion, you don\u2019t understand the requirement yet.',
    moment:
      'SPEC-005 defined 17 acceptance criteria for the Anomalies page. Not feature descriptions \u2014 testable contracts. AC 5 specified that mini-charts render dynamically from a typed data structure. AC 11 required each mock-up extension panel to contain \u201cat least one visual element beyond plain text.\u201d The spec also declared dependencies (SPEC-001 API routes, SPEC-002 filter context) and defined the exact data shape each anomaly panel would consume. The implementation machine received a behavior contract, not a wish list.',
    artifact: 'code' as const,
    artifactContent: `SPEC-005 \u2014 Anomalies & Recommendations Page
Date: 2026-02-20 | Status: READY | Dependencies: SPEC-001, SPEC-002

AC 5:  Mini charts render dynamically from panel.miniCharts[] \u2014
       bar charts for type: 'bar', grouped bars for type: 'grouped-bar'

AC 11: Each mock-up visual contains at least one visual element
       (chart wireframe, CSS shape, or structured layout) beyond
       plain text \u2014 not a solid-color empty div`,
    callout:
      'If you can\u2019t test it, you can\u2019t verify it. If you can\u2019t verify it, you\u2019re trusting luck.',
  },
  {
    number: 4,
    name: 'Spec-Check',
    principle: 'A second pair of eyes before code exists catches the cheapest bugs in the project.',
    moment:
      'The spec-check reviewed all 17 ACs for testability. It caught AC 11\u2019s original wording \u2014 \u201cvisual mock-up area is intentionally designed, not unfinished\u201d \u2014 and flagged it as subjective. How does a verifier test \u201cintentionally designed\u201d? The tightened version specified a concrete threshold: \u201cat least one visual element (chart wireframe, CSS shape, or structured layout) beyond plain text.\u201d Two minutes of spec editing prevented an ambiguous verification later.',
    artifact: 'before-after' as const,
    artifactContent: '',
    callout: 'This is where AI discipline pays off. The spec-check caught what self-review missed.',
  },
  {
    number: 5,
    name: 'Implement',
    principle: 'The machine that writes the code never wrote its own acceptance criteria.',
    moment:
      'Implementation ran on the Framework Desktop. The spec was written on the Mac. While Framework built the Anomalies page components \u2014 investigation panels, mini-charts, follow-up questions \u2014 the Mac was already writing SPEC-006 (this page). Neither machine touched the other\u2019s work. Git was the coordination layer: push from Framework, pull on Mac, verify, push back. The commit log is the audit trail.',
    artifact: 'table' as const,
    artifactContent: '',
    callout:
      'Writer/reviewer separation isn\u2019t overhead \u2014 it\u2019s the reason the dashboard works.',
  },
  {
    number: 6,
    name: 'Verify',
    principle:
      'Goal-backward: start from the acceptance criteria and work backward to the running code.',
    moment:
      'Verification used a fresh AI context window \u2014 no memory of implementation decisions, no familiarity bias. Each of the 17 ACs was tested individually against the deployed application: Does AC 1 pass? Evidence. Does AC 2 pass? Evidence. The result: PASS 17/17. Not \u201cit looks good\u201d \u2014 seventeen individual checks with documented evidence for each.',
    artifact: 'code' as const,
    artifactContent: `SPEC-004 Verification \u2014 Claims Explorer
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
AC 1:  \u2713  Page renders at /explorer, fetches /api/claims
AC 2:  \u2713  FilterBar present with all dimensions
AC 3:  \u2713  Mini trend chart with incurred/reversed
...
AC 17: \u2713  No horizontal overflow, text readable
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
Result: PASS (17/17)`,
    callout: 'PASS 17/17 means 17 individual tests passed. Not \u201cit looks fine.\u201d',
  },
  {
    number: 7,
    name: 'Ship',
    principle:
      'Every session\u2019s output becomes the next session\u2019s input. The process is cyclical, not linear.',
    moment:
      'After verification, a session log captured what was accomplished, what decisions were made, and what\u2019s next. The next morning\u2019s /open-session command reads that log automatically \u2014 the new AI context window starts with full continuity, not a cold start. Over 8+ sessions, zero context was lost. When context degraded mid-session, .continue-here.md checkpointed exact state: current task, decisions made, what\u2019s remaining. A new context window picked up exactly where the old one left off.',
    artifact: 'code' as const,
    artifactContent: `Session Log \u2014 2026-02-19 (Evening, Mac)
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
Accomplishments:
  \u2713 SPEC-003 fixed (7 items) \u2192 READY
  \u2713 SPEC-004 fixed (7 items) \u2192 READY
  \u2713 Compliance audit \u2014 3 gaps identified
  \u2713 Strategic planning \u2014 5 extension mock-ups

Next Steps:
  1. Verify SPEC-001 \u2014 /verify 001 on Mac
  2. Framework starts SPEC-002
  3. Saturday: write Anomalies spec`,
    callout: 'Most people start every AI conversation from scratch. This system never does.',
  },
];

/* ── Teal shades per stage (matching pipeline gradient) ── */
const stageColors = [
  {
    active: 'bg-teal-50 border-teal-300',
    circle: 'bg-teal-100 text-teal-700',
    circleInactive: 'bg-muted text-muted-foreground',
  },
  {
    active: 'bg-teal-50 border-teal-300',
    circle: 'bg-teal-200 text-teal-800',
    circleInactive: 'bg-muted text-muted-foreground',
  },
  {
    active: 'bg-teal-100/60 border-teal-300',
    circle: 'bg-teal-300 text-teal-900',
    circleInactive: 'bg-muted text-muted-foreground',
  },
  {
    active: 'bg-teal-100 border-teal-300',
    circle: 'bg-teal-400 text-white',
    circleInactive: 'bg-muted text-muted-foreground',
  },
  {
    active: 'bg-teal-200/60 border-teal-400',
    circle: 'bg-teal-500 text-white',
    circleInactive: 'bg-muted text-muted-foreground',
  },
  {
    active: 'bg-teal-200 border-teal-400',
    circle: 'bg-teal-600 text-white',
    circleInactive: 'bg-muted text-muted-foreground',
  },
  {
    active: 'bg-teal-300/60 border-teal-500',
    circle: 'bg-teal-700 text-white',
    circleInactive: 'bg-muted text-muted-foreground',
  },
];

/* ── Before/After grid for Spec-Check ── */
function BeforeAfterGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="rounded-md border border-red-200 bg-red-50/50 p-4">
        <p className="mb-1 text-xs font-medium tracking-wide text-red-700 uppercase">Before</p>
        <p className="text-muted-foreground font-mono text-xs leading-relaxed">
          &ldquo;Visual mock-up area is intentionally designed, not unfinished&rdquo;
        </p>
      </div>
      <div className="rounded-md border border-teal-200 bg-teal-50/50 p-4">
        <p className="mb-1 text-xs font-medium tracking-wide text-teal-700 uppercase">After</p>
        <p className="text-muted-foreground font-mono text-xs leading-relaxed">
          &ldquo;Contains at least one visual element (chart wireframe, CSS shape, or structured
          layout) beyond plain text&rdquo;
        </p>
      </div>
    </div>
  );
}

/* ── Dual-machine table for Implement ── */
function DualMachineTable() {
  const rows = [
    {
      mac: 'write SPEC-003: Executive Overview',
      framework: 'implement SPEC-003: KPIs, charts, insight cards',
    },
    {
      mac: 'verify SPEC-003: PASS 15/15 ACs',
      framework: 'implement SPEC-004: drugs table, days supply',
    },
    {
      mac: 'write SPEC-005: Anomalies',
      framework: 'implement SPEC-004: top groups, manufacturers',
    },
    { mac: 'spec-check SPEC-005: tighten AC 11', framework: '\u2014' },
  ];

  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/50 border-b">
            <th className="text-muted-foreground px-4 py-2 text-left font-medium">
              Mac (Architect)
            </th>
            <th className="text-muted-foreground px-4 py-2 text-left font-medium">
              Framework (Builder)
            </th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {rows.map((row, i) => (
            <tr key={i} className={i < rows.length - 1 ? 'border-b' : ''}>
              <td className="text-muted-foreground px-4 py-2">{row.mac}</td>
              <td className="text-muted-foreground px-4 py-2">{row.framework}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Artifact renderer ── */
function StageArtifact({ stage }: { stage: (typeof STAGES)[number] }) {
  switch (stage.artifact) {
    case 'code':
      return <CodeExcerpt>{stage.artifactContent}</CodeExcerpt>;
    case 'before-after':
      return <BeforeAfterGrid />;
    case 'table':
      return <DualMachineTable />;
  }
}

/* ── Main walkthrough component ── */
export function PipelineWalkthrough() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = STAGES[activeIndex];

  return (
    <div className="flex flex-col gap-0 md:flex-row md:gap-6">
      {/* Left column: stage list */}
      <div className="flex gap-1 overflow-x-auto md:w-[200px] md:shrink-0 md:flex-col md:overflow-x-visible">
        {STAGES.map((stage, i) => {
          const isActive = i === activeIndex;
          const colors = stageColors[i];
          return (
            <button
              key={stage.number}
              onClick={() => setActiveIndex(i)}
              className={`flex shrink-0 items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                isActive
                  ? `${colors.active} font-semibold text-teal-900`
                  : 'text-muted-foreground hover:bg-muted/50 border-transparent bg-transparent'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isActive ? colors.circle : colors.circleInactive
                }`}
              >
                {stage.number}
              </span>
              <span className="text-sm whitespace-nowrap">{stage.name}</span>
            </button>
          );
        })}
      </div>

      {/* Right column: active stage content */}
      <div className="mt-4 min-w-0 flex-1 space-y-4 md:mt-0">
        <p className="text-base leading-snug font-semibold">{active.principle}</p>
        <p className="text-muted-foreground text-sm leading-relaxed">{active.moment}</p>
        <StageArtifact stage={active} />
        <p className="text-muted-foreground border-t pt-3 text-sm italic">{active.callout}</p>
      </div>
    </div>
  );
}
