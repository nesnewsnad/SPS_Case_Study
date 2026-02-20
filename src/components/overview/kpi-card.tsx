'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KpiCardProps {
  label: string;
  value: string;
  subtitle?: string;
}

export const KpiCard = memo(function KpiCard({ label, value, subtitle }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium font-sans">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono">{value}</div>
        {subtitle && (
          <p className="text-xs mt-1 text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
});
