import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProcessPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          AI Process Documentation
        </h1>
        <p className="text-muted-foreground">
          How AI tools were used to build this analysis — methodology,
          iterations, and lessons learned
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tool Selection</CardTitle>
          </CardHeader>
          <CardContent className="flex h-48 items-center justify-center text-muted-foreground">
            Which tools, why, and how they were combined — coming next
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Architecture Decisions</CardTitle>
          </CardHeader>
          <CardContent className="flex h-48 items-center justify-center text-muted-foreground">
            Why Next.js + Postgres, multi-entity design, API patterns — coming
            next
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Prompts & Iterations</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
          What worked first try vs. what needed iteration — coming next
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Limitations & Workarounds</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center text-muted-foreground">
          Where AI tools fell short and how we adapted — coming next
        </CardContent>
      </Card>
    </div>
  );
}
