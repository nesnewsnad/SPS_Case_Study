import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AnomaliesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Anomalies & Insights</h1>
        <p className="text-muted-foreground">
          Key findings, recommendations, and forward-looking analysis
        </p>
      </div>

      {/* Anomaly Deep-Dive Cards */}
      <div className="space-y-4">
        {[
          {
            title: 'September Volume Spike',
            severity: 'high',
            summary: '70,984 claims in September — 43% above the monthly average of ~50K',
          },
          {
            title: 'November Volume Drop',
            severity: 'high',
            summary: '23,350 claims in November — 54% below the monthly average',
          },
          {
            title: 'Kansas Reversal Anomaly',
            severity: 'medium',
            summary: '15.8% reversal rate in Kansas vs ~10% in all other states',
          },
        ].map((anomaly) => (
          <Card key={anomaly.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle>{anomaly.title}</CardTitle>
                <Badge variant={anomaly.severity === 'high' ? 'destructive' : 'secondary'}>
                  {anomaly.severity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">{anomaly.summary}</p>
              <div className="bg-muted/30 text-muted-foreground flex h-48 items-center justify-center rounded-md border text-sm">
                Drill-down chart — coming next
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Follow-Up Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Follow-Up Questions & Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground flex h-48 items-center justify-center">
          Client questions, internal team questions, data requests — coming next
        </CardContent>
      </Card>

      {/* Extension Mock-Up */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Extension — Future Vision</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground flex h-64 items-center justify-center">
          Placeholder panels for pricing, demographics, formulary tiers, reimbursement — coming next
        </CardContent>
      </Card>
    </div>
  );
}
