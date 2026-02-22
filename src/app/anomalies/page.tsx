'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AnomalyPanel } from '@/components/anomalies/anomaly-panel';
import { FollowUpQuestions } from '@/components/anomalies/follow-up-questions';
import { ExtensionMockups } from '@/components/anomalies/extension-mockup';
import type { AnomaliesResponse } from '@/lib/api-types';

// --- Skeleton sections ---

function PanelSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="ml-auto h-5 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  );
}

function QuestionsSkeletion() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-8 w-80" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MockupsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-48" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-8 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// --- Main page ---

export default function AnomaliesPage() {
  const [data, setData] = useState<AnomaliesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    fetch('/api/anomalies?entityId=1')
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((json: AnomaliesResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Error state ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-12">
        <p className="text-destructive font-medium">Failed to load anomaly data</p>
        <p className="text-muted-foreground text-sm">{error}</p>
        <Button variant="outline" onClick={fetchData}>
          Retry
        </Button>
      </div>
    );
  }

  // --- Loading state ---
  if (loading || !data) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Anomalies &amp; Recommendations</h1>
          <p className="text-muted-foreground">
            Pharmacy A — Data Quality Findings, Follow-Up Questions, &amp; Forward-Looking Analysis
          </p>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <PanelSkeleton key={i} />
          ))}
        </div>
        <QuestionsSkeletion />
        <MockupsSkeleton />
      </div>
    );
  }

  // --- Loaded state ---
  return (
    <div className="stagger-children space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Anomalies &amp; Recommendations</h1>
        <p className="text-muted-foreground text-sm">
          Pharmacy A — Data Quality Findings, Follow-Up Questions, &amp; Forward-Looking Analysis
        </p>
        <div className="mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-teal-400 to-teal-600" />
      </div>

      {/* Section 1: Anomaly Investigation Panels */}
      <section className="space-y-4">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Investigation Panels
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Four anomalies and two structural patterns emerged from 596,000 claims rows. One was a
          planted test that any analytics vendor should catch. One was a traceable batch event
          affecting 18 Kansas groups. Two align with the realities of LTC pharmacy in 2021 — a
          Delta-wave recovery surge in September and a staffing-crisis contraction in November.
          Underneath the anomalies, Pharmacy A&apos;s fundamentals are sound: a heavily generic drug
          mix, uniform ~10% reversal rates across all states, and textbook LTC dispensing cycles.
          The dataset does flag one analytical boundary — categorical flags (formulary,
          adjudication) appear randomized, meaning formulary-tier optimization requires production
          data to validate. Everything else here is actionable today.
        </p>
        {data.panels.map((panel) => (
          <AnomalyPanel key={panel.id} panel={panel} />
        ))}
      </section>

      {/* Section: Recommendation */}
      <section className="space-y-4 border-t pt-6">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Recommendation
        </h2>
        <Card className="border-l-4 border-l-teal-400 shadow-sm">
          <CardContent className="space-y-5 pt-6">
            {/* Green */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  &#10003;
                </span>
                <h3 className="text-sm font-semibold">Sound Fundamentals — No Action Needed</h3>
              </div>
              <p className="text-muted-foreground pl-8 text-sm leading-relaxed">
                Pharmacy A&apos;s drug mix is 84% generic (MONY Y) — strong cost discipline for LTC.
                Reversal rates are uniform at ~10% across all five states and all formulary types —
                no outlier groups, no systematic billing issues. Dispensing patterns (7-14 day
                cycles, 1st-of-month fills) are textbook LTC operations. These are the fundamentals
                of a clean book of business.
              </p>
            </div>

            {/* Yellow */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                  ?
                </span>
                <h3 className="text-sm font-semibold">Needs a Conversation — Not a Concern</h3>
              </div>
              <p className="text-muted-foreground pl-8 text-sm leading-relaxed">
                The Kansas batch reversal is traceable and clean (reverse → rebill → resume), but
                the root cause matters for ongoing claims management: was it a pricing correction, a
                plan migration, or an audit recoupment? September and November volume swings of +41%
                / -54% — whether COVID-driven or seasonal — affect rate-setting and should be
                modeled into projections. These aren&apos;t red flags. They&apos;re the right
                questions to ask before contract finalization.
              </p>
            </div>

            {/* Red */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                  !
                </span>
                <h3 className="text-sm font-semibold">
                  Analytical Boundary — Requires Production Data
                </h3>
              </div>
              <p className="text-muted-foreground pl-8 text-sm leading-relaxed">
                Formulary-tier optimization — the highest-value PBM lever — cannot be validated with
                this dataset. Categorical flags (formulary, adjudication) appear randomized across
                all dimensions, meaning any formulary strategy recommendation would be unreliable.
                This is the most important next step: production data with real adjudication
                outcomes unlocks the analysis that moves Pharmacy A from &quot;clean book&quot; to
                &quot;optimized book.&quot;
              </p>
            </div>

            {/* Closer */}
            <div className="rounded-r border-l-4 border-teal-300 bg-teal-50/50 px-5 py-3.5">
              <p className="text-sm leading-relaxed font-medium text-teal-900">
                Pharmacy A&apos;s fundamentals don&apos;t raise concerns — they raise opportunities.
                The data supports onboarding; the next dataset unlocks optimization.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 2: Follow-Up Questions */}
      <section className="space-y-4 border-t pt-6">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Follow-Up &amp; Next Steps
        </h2>
        <FollowUpQuestions />
      </section>

      {/* Section 3: Dashboard Extension Mock-Ups */}
      <section className="space-y-4 border-t pt-6">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Platform Vision
        </h2>
        <ExtensionMockups />
      </section>
    </div>
  );
}
