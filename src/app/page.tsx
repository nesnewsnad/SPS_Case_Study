import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Executive Overview</h1>
        <p className="text-muted-foreground">Pharmacy A — 2021 Claims Utilization Summary</p>
      </div>

      {/* KPI Cards Placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Claims', value: '—' },
          { title: 'Net Claims', value: '—' },
          { title: 'Reversal Rate', value: '—' },
          { title: 'Unique Drugs', value: '—' },
        ].map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Monthly Claims Trend</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground flex h-80 items-center justify-center">
            Chart component — coming next
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Claims by Formulary</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground flex h-80 items-center justify-center">
            Chart component — coming next
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Claims by State</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground flex h-64 items-center justify-center">
            Chart component — coming next
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Adjudication Rates</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground flex h-64 items-center justify-center">
            Chart component — coming next
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
