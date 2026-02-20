'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, AlertTriangle, TrendingUp } from 'lucide-react';
import type { InsightCard } from '@/lib/generate-insights';

const SEVERITY_STYLES: Record<
  InsightCard['severity'],
  { border: string; icon: string; Icon: typeof Info }
> = {
  info: { border: 'border-l-teal-500', icon: 'text-teal-500', Icon: Info },
  warning: { border: 'border-l-amber-500', icon: 'text-amber-500', Icon: AlertTriangle },
  positive: { border: 'border-l-emerald-500', icon: 'text-emerald-500', Icon: TrendingUp },
};

interface InsightCardsProps {
  insights: InsightCard[];
}

export const InsightCards = memo(function InsightCards({ insights }: InsightCardsProps) {
  if (insights.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight) => {
        const style = SEVERITY_STYLES[insight.severity];
        return (
          <Card key={insight.id} className={`border-l-4 ${style.border}`}>
            <CardHeader className="pb-1.5">
              <div className="flex items-start gap-2">
                <style.Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.icon}`} />
                <CardTitle className="text-sm leading-snug font-semibold">
                  {insight.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">{insight.body}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
