import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterBar } from '@/components/filter-bar';

export default function ExplorerPage() {
  return (
    <>
      <FilterBar view="explorer" />
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Claims Explorer</h1>
          <p className="text-muted-foreground">Filter and drill into claims by any dimension</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Drugs by Volume</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground flex h-80 items-center justify-center">
              Chart component — coming next
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Days Supply Distribution</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground flex h-80 items-center justify-center">
              Chart component — coming next
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reversal Analysis</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground flex h-64 items-center justify-center">
            Chart component — coming next
          </CardContent>
        </Card>
      </div>
    </>
  );
}
