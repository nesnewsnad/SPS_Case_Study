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
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-5 pb-1">
        <CardTitle className="text-muted-foreground font-sans text-xs font-semibold tracking-wider uppercase">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-3xl font-bold tracking-tight">{value}</div>
        {subtitle && <p className="text-muted-foreground mt-1.5 text-xs">{subtitle}</p>}
      </CardContent>
    </Card>
  );
});
