'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KpiDelta {
  value: number;
  label: string;
}

interface KpiCardProps {
  label: string;
  value: string;
  delta?: KpiDelta;
}

export const KpiCard = memo(function KpiCard({ label, value, delta }: KpiCardProps) {
  const showDelta = delta && Math.abs(delta.value) > 2;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium font-sans">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono">{value}</div>
        {showDelta && (
          <p
            className={`text-xs mt-1 ${
              delta.value > 0 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {delta.value > 0 ? '+' : ''}
            {delta.value.toFixed(1)}% {delta.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
});
