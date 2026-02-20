'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { InsightCard } from '@/lib/generate-insights';

const SEVERITY_BORDER: Record<InsightCard['severity'], string> = {
  info: 'border-l-teal-500',
  warning: 'border-l-amber-500',
  positive: 'border-l-emerald-500',
};

interface InsightCardsProps {
  insights: InsightCard[];
}

export const InsightCards = memo(function InsightCards({ insights }: InsightCardsProps) {
  if (insights.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight) => (
        <Card
          key={insight.id}
          className={`border-l-4 ${SEVERITY_BORDER[insight.severity]}`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{insight.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{insight.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
