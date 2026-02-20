import { Card, CardContent } from '@/components/ui/card';

/* ── Badge colors matching pipeline teal gradient ── */
const badgeStyles: Record<string, string> = {
  '2': 'bg-teal-100 text-teal-800',
  '3': 'bg-teal-200 text-teal-900',
  '4': 'bg-teal-300 text-teal-900',
  '5': 'bg-teal-500 text-white',
};

function StageBadge({ stage, label }: { stage: string; label: string }) {
  return (
    <span
      className={`${badgeStyles[stage] ?? 'bg-teal-100 text-teal-800'} inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium`}
    >
      Stage {stage} &mdash; {label}
    </span>
  );
}

function ArtifactCard({
  stage,
  stageLabel,
  title,
  callout,
  children,
}: {
  stage: string;
  stageLabel: string;
  title: string;
  callout: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="py-5">
      <CardContent className="space-y-3 px-5">
        <StageBadge stage={stage} label={stageLabel} />
        <h3 className="text-base font-semibold">{title}</h3>
        {children}
        <p className="text-muted-foreground text-sm italic">{callout}</p>
      </CardContent>
    </Card>
  );
}

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

/* ── Artifact 1: The Spec ── */
function ArtifactSpec() {
  return (
    <ArtifactCard
      stage="2"
      stageLabel="Spec"
      title="What a real AI-driven spec looks like"
      callout="Every AC is testable. 'Looks good' is not an acceptance criterion."
    >
      <CodeExcerpt>
        {`SPEC-005 — Anomalies & Recommendations Page
Date: 2026-02-20 | Status: READY | Dependencies: SPEC-001, SPEC-002

AC 5:  Mini charts render dynamically from panel.miniCharts[] —
       bar charts for type: 'bar', grouped bars for type: 'grouped-bar'

AC 11: Each mock-up visual contains at least one visual element
       (chart wireframe, CSS shape, or structured layout) beyond
       plain text — not a solid-color empty div`}
      </CodeExcerpt>
    </ArtifactCard>
  );
}

/* ── Artifact 2: The Spec-Check (before/after) ── */
function ArtifactSpecCheck() {
  return (
    <ArtifactCard
      stage="3"
      stageLabel="Spec-Check"
      title="What the review loop catches"
      callout="Subjective → measurable. The spec-check caught this before a single line of code was written."
    >
      <div className="grid grid-cols-2 gap-3">
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
    </ArtifactCard>
  );
}

/* ── Artifact 3: Dual-Machine (two-column commit log) ── */
function ArtifactDualMachine() {
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
    <ArtifactCard
      stage="4"
      stageLabel="Implement"
      title="The machine that writes the code doesn't verify it"
      callout="Separation of concerns. The architect never touches implementation. The builder never writes its own acceptance criteria."
    >
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
    </ArtifactCard>
  );
}

/* ── Artifact 4: Verification Report ── */
function ArtifactVerification() {
  return (
    <ArtifactCard
      stage="5"
      stageLabel="Verify"
      title="PASS means every AC tested"
      callout='Not "it looks right." Every acceptance criterion, individually tested, with evidence.'
    >
      <CodeExcerpt>
        {`SPEC-004 Verification — Claims Explorer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AC 1:  ✓  Page renders at /explorer, fetches /api/claims
AC 2:  ✓  FilterBar present with all dimensions
AC 3:  ✓  Mini trend chart with incurred/reversed
...
AC 17: ✓  No horizontal overflow, text readable
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Result: PASS (17/17)`}
      </CodeExcerpt>
    </ArtifactCard>
  );
}

/* ── All 4 artifacts in a vertical stack ── */
export function ArtifactEvidence() {
  return (
    <div className="space-y-4">
      <ArtifactSpec />
      <ArtifactSpecCheck />
      <ArtifactDualMachine />
      <ArtifactVerification />
    </div>
  );
}
