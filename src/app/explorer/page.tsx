import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExplorerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Claims Explorer</h1>
        <p className="text-muted-foreground">
          Filter and drill into claims by any dimension
        </p>
      </div>

      {/* Filter Bar Placeholder */}
      <Card>
        <CardContent className="flex flex-wrap gap-3 py-4">
          {[
            "Formulary",
            "State",
            "MONY",
            "Manufacturer",
            "Drug",
            "Group",
            "Date Range",
          ].map((filter) => (
            <div
              key={filter}
              className="h-9 rounded-md border bg-muted/50 px-4 py-2 text-xs text-muted-foreground"
            >
              {filter}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Charts Placeholder */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Drugs by Volume</CardTitle>
          </CardHeader>
          <CardContent className="flex h-80 items-center justify-center text-muted-foreground">
            Chart component — coming next
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Days Supply Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex h-80 items-center justify-center text-muted-foreground">
            Chart component — coming next
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reversal Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
          Chart component — coming next
        </CardContent>
      </Card>
    </div>
  );
}
