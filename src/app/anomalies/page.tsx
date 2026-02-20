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
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
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
        {data.panels.map((panel) => (
          <AnomalyPanel key={panel.id} panel={panel} />
        ))}
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
          Forward-Looking Extensions
        </h2>
        <ExtensionMockups />
      </section>
    </div>
  );
}
