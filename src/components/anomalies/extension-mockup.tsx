'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, DollarSign, HeartPulse, AlertTriangle, type LucideIcon } from 'lucide-react';

// ---------- Visual mock-up areas (structured, not empty boxes) ----------

function OnboardingMockup() {
  return (
    <div className="border-muted-foreground/20 bg-muted/30 relative h-44 overflow-hidden rounded-lg border border-dashed p-4">
      <div className="absolute inset-0 flex items-center justify-center">
        <Badge variant="outline" className="bg-background/80 text-xs backdrop-blur">
          Coming Soon
        </Badge>
      </div>
      <div className="flex gap-4 opacity-40">
        {/* Pharmacy A column */}
        <div className="flex-1 space-y-2">
          <div className="text-muted-foreground text-[10px] font-semibold">Pharmacy A</div>
          <div className="h-3 w-3/4 rounded bg-teal-400/60" />
          <div className="h-3 w-1/2 rounded bg-teal-400/40" />
          <div className="h-3 w-5/6 rounded bg-teal-400/50" />
          <div className="mt-3 space-y-1">
            {[70, 45, 60, 55, 80, 40].map((w, i) => (
              <div key={i} className="h-2 rounded bg-teal-300/30" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
        {/* Pharmacy B column */}
        <div className="flex-1 space-y-2">
          <div className="text-muted-foreground text-[10px] font-semibold">Pharmacy B</div>
          <div className="h-3 w-2/3 rounded bg-blue-400/60" />
          <div className="h-3 w-3/5 rounded bg-blue-400/40" />
          <div className="h-3 w-1/2 rounded bg-blue-400/50" />
          <div className="mt-3 space-y-1">
            {[55, 65, 40, 75, 50, 60].map((w, i) => (
              <div key={i} className="h-2 rounded bg-blue-300/30" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingMockup() {
  return (
    <div className="border-muted-foreground/20 bg-muted/30 relative h-44 overflow-hidden rounded-lg border border-dashed p-4">
      <div className="absolute inset-0 flex items-center justify-center">
        <Badge variant="outline" className="bg-background/80 text-xs backdrop-blur">
          Coming Soon
        </Badge>
      </div>
      {/* Volume bars with cost overlay line */}
      <div className="flex h-28 items-end gap-1.5 pt-2 opacity-40">
        {[40, 55, 35, 70, 50, 90, 45, 60, 85, 38, 20, 52].map((h, i) => (
          <div key={i} className="relative flex-1">
            <div className="rounded-t bg-teal-400/40" style={{ height: `${h}%` }} />
            {/* Cost dot */}
            <div
              className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-500/70"
              style={{ bottom: `${Math.min(h + 10, 95)}%` }}
            />
          </div>
        ))}
      </div>
      {/* SVG trend line */}
      <svg className="absolute inset-x-4 top-6 h-28 opacity-30" preserveAspectRatio="none">
        <polyline
          points="0,60 30,50 60,65 90,35 120,45 150,20 180,40 210,30 240,15 270,50 300,70 330,38"
          fill="none"
          stroke="#d97706"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
      </svg>
    </div>
  );
}

function DemographicsMockup() {
  return (
    <div className="border-muted-foreground/20 bg-muted/30 relative h-44 overflow-hidden rounded-lg border border-dashed p-4">
      <div className="absolute inset-0 flex items-center justify-center">
        <Badge variant="outline" className="bg-background/80 text-xs backdrop-blur">
          Coming Soon
        </Badge>
      </div>
      {/* Age/gender pyramid */}
      <div className="flex flex-col gap-1 pt-1 opacity-40">
        {[
          { label: '85+', m: 25, f: 30 },
          { label: '75-84', m: 45, f: 50 },
          { label: '65-74', m: 60, f: 65 },
          { label: '55-64', m: 35, f: 40 },
          { label: '45-54', m: 20, f: 25 },
          { label: '<45', m: 10, f: 15 },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-1">
            <div className="flex flex-1 justify-end">
              <div className="h-3 rounded-l bg-blue-400/50" style={{ width: `${row.m}%` }} />
            </div>
            <div className="text-muted-foreground w-8 text-center text-[9px]">{row.label}</div>
            <div className="flex-1">
              <div className="h-3 rounded-r bg-pink-400/50" style={{ width: `${row.f}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnomalyDetectionMockup() {
  return (
    <div className="border-muted-foreground/20 bg-muted/30 relative h-44 overflow-hidden rounded-lg border border-dashed p-4">
      <div className="absolute inset-0 flex items-center justify-center">
        <Badge variant="outline" className="bg-background/80 text-xs backdrop-blur">
          Coming Soon
        </Badge>
      </div>
      {/* Timeline sparkline with anomaly dots */}
      <svg className="mt-2 h-24 w-full opacity-40" viewBox="0 0 300 80" preserveAspectRatio="none">
        {/* Baseline band */}
        <rect
          x="0"
          y="25"
          width="300"
          height="30"
          fill="currentColor"
          className="text-muted"
          opacity="0.3"
        />
        {/* Trend line */}
        <polyline
          points="0,40 25,38 50,42 75,36 100,35 125,10 150,38 175,40 200,42 225,65 250,38 275,40 300,38"
          fill="none"
          stroke="#0d9488"
          strokeWidth="2"
        />
        {/* Anomaly markers */}
        <circle cx="125" cy="10" r="5" fill="#dc2626" opacity="0.8" />
        <circle cx="225" cy="65" r="5" fill="#dc2626" opacity="0.8" />
        {/* Labels */}
        <text x="125" y="7" textAnchor="middle" fontSize="7" fill="#dc2626" fontWeight="bold">
          SPIKE
        </text>
        <text x="225" y="78" textAnchor="middle" fontSize="7" fill="#dc2626" fontWeight="bold">
          DIP
        </text>
      </svg>
      {/* Alert badges */}
      <div className="mt-1 flex gap-2 opacity-40">
        <div className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] text-red-700">
          2 anomalies detected
        </div>
        <div className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] text-amber-700">
          1 data quality flag
        </div>
      </div>
    </div>
  );
}

// ---------- Mockup definitions ----------

interface MockupDef {
  icon: LucideIcon;
  title: string;
  visual: React.ComponentType;
  narrative: string;
  dataNeeded: string[];
}

const MOCKUPS: MockupDef[] = [
  {
    icon: Building2,
    title: 'Client Onboarding & Comparison',
    visual: OnboardingMockup,
    narrative:
      'The multi-entity architecture is already in place \u2014 entity_id on every claims row supports onboarding additional pharmacy clients day one. Upload a CSV, auto-ingest, and immediately compare KPIs, overlay monthly trends, and benchmark reversal rates across clients. No schema changes required.',
    dataNeeded: ['Additional client CSV exports in the same format'],
  },
  {
    icon: DollarSign,
    title: 'Pricing & Reimbursement Overlay',
    visual: PricingMockup,
    narrative:
      'Layering cost data onto utilization reveals whether high-volume drugs are also high-cost, identifies pricing outliers, and enables AWP vs. reimbursement spread analysis. Combined with formulary tier data, this powers contract negotiation intelligence.',
    dataNeeded: ['AWP/WAC pricing', 'Reimbursement amounts', 'Dispensing fees'],
  },
  {
    icon: HeartPulse,
    title: 'Patient Demographics & Utilization',
    visual: DemographicsMockup,
    narrative:
      'Patient-level data (de-identified) unlocks utilization patterns: polypharmacy rates, medication adherence, therapy switching, and high-risk patient identification. For LTC populations, age and diagnosis stratification drives clinical intervention targeting.',
    dataNeeded: ['De-identified patient IDs', 'Age, gender', 'Diagnosis codes (ICD-10)'],
  },
  {
    icon: AlertTriangle,
    title: 'Automated Anomaly Detection',
    visual: AnomalyDetectionMockup,
    narrative:
      'A statistical engine that runs on every data ingestion: flags volume deviations >2\u03C3 from rolling baseline, detects batch reversal patterns automatically, identifies test/dummy records by distribution analysis, and alerts on new NDCs not in the drug reference. Every anomaly found in this analysis was detectable programmatically.',
    dataNeeded: [
      'Automated pipeline access',
      'Historical baseline data',
      'Configurable alert thresholds',
    ],
  },
];

// ---------- Component ----------

function ExtensionMockupCard({ def }: { def: MockupDef }) {
  const Icon = def.icon;
  const Visual = def.visual;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Icon className="text-muted-foreground h-5 w-5" />
          <CardTitle className="text-base">{def.title}</CardTitle>
          <Badge variant="outline" className="ml-auto text-[10px] tracking-wider uppercase">
            Future
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-3">
        <Visual />
        <p className="text-sm leading-relaxed">{def.narrative}</p>
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
            Data Required
          </p>
          <ul className="text-muted-foreground list-disc space-y-0.5 pl-4 text-xs">
            {def.dataNeeded.map((d) => (
              <li key={d}>{d}</li>
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
        <h2 className="text-xl font-semibold">Dashboard Extensions</h2>
        <p className="text-muted-foreground text-sm">
          Forward-looking features enabled by additional data sources
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {MOCKUPS.map((def) => (
          <ExtensionMockupCard key={def.title} def={def} />
        ))}
      </div>
    </div>
  );
});
