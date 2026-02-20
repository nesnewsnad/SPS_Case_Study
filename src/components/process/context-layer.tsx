import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const items = [
  {
    name: 'CLAUDE.md',
    description:
      'Living project brain. Data findings, architecture decisions, schema, anomaly writeups \u2014 AI reads this every session. Single source of truth that grows with the project.',
  },
  {
    name: 'Session Logs',
    description:
      'Every session opens by reading the last session log. Every session closes by writing one. Accomplishments, decisions, next steps. AI never starts cold.',
  },
  {
    name: '.continue-here.md',
    description:
      'Mid-session state capture. When context degrades or you switch tasks, checkpoint everything \u2014 current state, decisions made, what\u2019s remaining. A new AI context window picks up exactly where you left off.',
  },
];

export function ContextLayer() {
  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
        Context Layer &mdash; how AI remembers across sessions
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Card key={item.name} className="py-4">
            <CardHeader className="px-4 pb-1">
              <CardTitle className="font-mono text-sm">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <p className="text-muted-foreground text-sm leading-snug">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
