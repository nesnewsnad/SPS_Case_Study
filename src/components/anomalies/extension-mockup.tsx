'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FolderInput,
  BrainCircuit,
  GitCompareArrows,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';

// ---------- Visual mock-up areas ----------

function IntakeMockup() {
  return (
    <div className="border-muted-foreground/20 bg-muted/30 relative h-48 overflow-hidden rounded-lg border border-dashed p-4">
      <div className="absolute inset-0 flex items-center justify-center">
        <Badge variant="outline" className="bg-background/80 text-xs backdrop-blur">
          Coming Soon
        </Badge>
      </div>
      <div className="flex h-full flex-col justify-between opacity-40">
        {/* Dropbox folder → file list */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-blue-500/60" />
            <div className="text-muted-foreground text-[10px] font-semibold tracking-wide">
              /sps-intake/
            </div>
          </div>
          {[
            { name: 'pharmacy_b_claims.csv', size: '412K rows', status: 'valid' },
            { name: 'pharmacy_b_drugs.csv', size: '198K rows', status: 'valid' },
            { name: 'pharmacy_c_claims.csv', size: '—', status: 'pending' },
          ].map((f) => (
            <div key={f.name} className="flex items-center gap-2 pl-6">
              <div
                className={`h-1.5 w-1.5 rounded-full ${f.status === 'valid' ? 'bg-emerald-500' : 'bg-amber-400'}`}
              />
              <span className="text-muted-foreground font-mono text-[9px]">{f.name}</span>
              <span className="text-muted-foreground/60 ml-auto text-[8px]">{f.size}</span>
            </div>
          ))}
        </div>
        {/* Processing pipeline indicator */}
        <div className="flex items-center gap-1.5">
          {['Detect Format', 'Validate Schema', 'Map Columns', 'Load to DB'].map((step, i) => (
            <div key={step} className="flex items-center gap-1">
              <div
                className={`rounded px-1.5 py-0.5 text-[7px] font-semibold ${i < 3 ? 'bg-teal-100 text-teal-700' : 'bg-muted text-muted-foreground'}`}
              >
                {step}
              </div>
              {i < 3 && <ArrowRight className="text-muted-foreground/40 h-2.5 w-2.5" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalysisMockup() {
  return (
    <div className="border-muted-foreground/20 bg-muted/30 relative h-48 overflow-hidden rounded-lg border border-dashed p-4">
      <div className="absolute inset-0 flex items-center justify-center">
        <Badge variant="outline" className="bg-background/80 text-xs backdrop-blur">
          Coming Soon
        </Badge>
      </div>
      <div className="flex h-full flex-col justify-between opacity-40">
        {/* Analysis output stream */}
        <div className="space-y-1.5 font-mono text-[9px]">
          <div className="flex items-center gap-1.5">
            <span className="text-teal-600">&#9679;</span>
            <span className="text-muted-foreground">Statistical profiling complete</span>
            <span className="text-muted-foreground/50 ml-auto">2.1s</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-teal-600">&#9679;</span>
            <span className="text-muted-foreground">Drug reference matched — 99.2% coverage</span>
            <span className="text-muted-foreground/50 ml-auto">0.8s</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-500">&#9650;</span>
            <span className="text-amber-700">Test NDC detected: NDC 55111-0462</span>
            <span className="text-muted-foreground/50 ml-auto">1.4s</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-red-500">&#9679;</span>
            <span className="text-red-700">Batch reversal: 22 groups, Aug-Sep</span>
            <span className="text-muted-foreground/50 ml-auto">3.2s</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-teal-600">&#9679;</span>
            <span className="text-muted-foreground">Narrative generation complete</span>
            <span className="text-muted-foreground/50 ml-auto">4.7s</span>
          </div>
        </div>
        {/* Results summary badges */}
        <div className="flex gap-2">
          <div className="rounded bg-teal-100 px-2 py-0.5 text-[9px] font-semibold text-teal-700">
            4 anomalies flagged
          </div>
          <div className="rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
            Dashboard generated
          </div>
          <div className="rounded bg-blue-100 px-2 py-0.5 text-[9px] font-semibold text-blue-700">
            12 insights written
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonMockup() {
  return (
    <div className="border-muted-foreground/20 bg-muted/30 relative h-48 overflow-hidden rounded-lg border border-dashed p-4">
      <div className="absolute inset-0 flex items-center justify-center">
        <Badge variant="outline" className="bg-background/80 text-xs backdrop-blur">
          Coming Soon
        </Badge>
      </div>
      <div className="flex h-full flex-col opacity-40">
        {/* KPI comparison rows */}
        <div className="text-muted-foreground mb-2 flex items-center justify-between text-[10px] font-semibold">
          <span>Cross-Client Benchmarks</span>
          <span className="text-muted-foreground/60">3 clients loaded</span>
        </div>
        <div className="flex-1 space-y-2">
          {[
            { metric: 'Generic Rate', a: 84, b: 71, c: 89, unit: '%' },
            { metric: 'Reversal Rate', a: 10, b: 14, c: 9, unit: '%' },
            { metric: 'Avg Days Supply', a: 13, b: 22, c: 11, unit: 'd' },
            { metric: 'Claims Volume', a: 75, b: 60, c: 45, unit: 'K' },
          ].map((row) => (
            <div key={row.metric} className="space-y-0.5">
              <div className="text-muted-foreground flex items-center justify-between text-[8px]">
                <span>{row.metric}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex flex-1 items-center gap-0.5">
                  <div className="h-2.5 rounded bg-teal-400/70" style={{ width: `${row.a}%` }} />
                  <span className="text-[7px] font-semibold whitespace-nowrap text-teal-700">
                    A: {row.a}
                    {row.unit}
                  </span>
                </div>
                <div className="flex flex-1 items-center gap-0.5">
                  <div className="h-2.5 rounded bg-blue-400/70" style={{ width: `${row.b}%` }} />
                  <span className="text-[7px] font-semibold whitespace-nowrap text-blue-700">
                    B: {row.b}
                    {row.unit}
                  </span>
                </div>
                <div className="flex flex-1 items-center gap-0.5">
                  <div className="h-2.5 rounded bg-violet-400/70" style={{ width: `${row.c}%` }} />
                  <span className="text-[7px] font-semibold whitespace-nowrap text-violet-700">
                    C: {row.c}
                    {row.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Anomaly overlap */}
        <div className="mt-2 flex gap-2">
          <div className="rounded bg-amber-100 px-2 py-0.5 text-[8px] font-semibold text-amber-700">
            Shared pattern: batch reversals (A, B)
          </div>
          <div className="rounded bg-teal-100 px-2 py-0.5 text-[8px] font-semibold text-teal-700">
            C: cleanest book
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Pipeline definitions ----------

interface PipelineStageDef {
  icon: LucideIcon;
  title: string;
  stage: string;
  visual: React.ComponentType;
  narrative: string;
  alreadyBuilt: string[];
}

const PIPELINE: PipelineStageDef[] = [
  {
    icon: FolderInput,
    title: 'Drop It In',
    stage: 'Stage 1: Intake',
    visual: IntakeMockup,
    narrative:
      'A shared Dropbox folder becomes the intake point. Drop in a claims CSV and the system auto-detects the format — tilde-delimited, BOM-encoded, pipe-separated — validates the schema, maps columns to our canonical model, matches NDCs against the drug reference, and loads it into the multi-entity database. The same edge cases we handled manually for Pharmacy A (BOM headers, 30 unmatched NDCs, the Kryptonite test drug) become automated detection rules. A new client onboards in minutes, not weeks.',
    alreadyBuilt: [
      'Multi-entity schema (entity_id on every row)',
      'CSV parsing with BOM/delimiter detection',
      'NDC matching pipeline (99.5% coverage)',
      'Drug reference table (247K NDCs)',
    ],
  },
  {
    icon: BrainCircuit,
    title: 'Instant Analysis',
    stage: 'Stage 2: Auto-EDA',
    visual: AnalysisMockup,
    narrative:
      'Claude runs the full analytical playbook against every new dataset: statistical profiling, distribution analysis, anomaly detection, baseline rate computation, and narrative generation. The four anomalies we surfaced for Pharmacy A — the Kryptonite easter egg, the Kansas batch reversal, the September spike, the November dip — each becomes a detection pattern. Test drugs flagged by fictional manufacturer names and impossible concentration. Batch reversals caught by group-level reversal-rate inversion. Volume anomalies identified by deviation from rolling baselines. The analysis that took days runs in seconds, and the output is a complete dashboard with written insights — not raw charts.',
    alreadyBuilt: [
      'EDA playbook documented (CLAUDE.md)',
      'Anomaly detection patterns (4 types)',
      'Narrative generation (insight templates)',
      'Context-aware chat (Claude API integration)',
    ],
  },
  {
    icon: GitCompareArrows,
    title: 'Compare & Compete',
    stage: 'Stage 3: Cross-Client Intelligence',
    visual: ComparisonMockup,
    narrative:
      "Every new client makes the platform smarter. Overlay monthly trends across pharmacies, benchmark reversal rates, compare generic adoption, identify where one client's anomaly matches another's pattern. Pharmacy A's 84% generic rate becomes a benchmark — is Pharmacy B's 71% a red flag or a formulary difference? The Kansas batch reversal pattern, once detected in one client, becomes a known signature to watch for across all clients. This isn't just reporting. It's competitive intelligence that compounds with every RFP.",
    alreadyBuilt: [
      'Multi-entity API routes (all endpoints accept entityId)',
      'Entity selector in sidebar navigation',
      'Server-side aggregation (never ships raw rows)',
      'Anomaly classification taxonomy',
    ],
  },
];

// ---------- Component ----------

function PipelineStageCard({ def, index }: { def: PipelineStageDef; index: number }) {
  const Icon = def.icon;
  const Visual = def.visual;

  return (
    <Card className="flex flex-col shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              {def.stage}
            </span>
            <CardTitle className="text-base">{def.title}</CardTitle>
          </div>
          <Badge variant="outline" className="ml-auto text-[10px] tracking-wider uppercase">
            Future
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-3">
        <Visual />
        <p className="text-sm leading-relaxed">{def.narrative}</p>
        <div className="bg-muted/40 mt-auto rounded-md px-3.5 py-2.5">
          <p className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
            Already Built
          </p>
          <ul className="text-muted-foreground list-disc space-y-0.5 pl-4 text-xs">
            {def.alreadyBuilt.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export const ExtensionMockups = memo(function ExtensionMockups() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
          Platform Vision
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          This dashboard is Pharmacy A. The architecture is built for every pharmacy after it. One
          folder, one pipeline, every RFP analyzed automatically — the same rigor we applied here,
          running at scale.
        </p>
      </div>
      {/* Pipeline flow arrow between cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {PIPELINE.map((def, i) => (
          <PipelineStageCard key={def.title} def={def} index={i} />
        ))}
      </div>
    </div>
  );
});
