import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const tools = [
  {
    name: 'Claude Code CLI',
    role: 'Primary AI partner. Specs, implementation, verification \u2014 all through the CLI. Not a chat window \u2014 a terminal-native workflow that reads project files, writes code, and runs tests.',
  },
  {
    name: 'Next.js 14',
    role: 'App Router, server components, API routes. Zero-config deployment to Vercel. The same framework used in production by companies at scale.',
  },
  {
    name: 'Vercel Postgres',
    role: 'Neon-backed, production-grade. Multi-entity schema from day one. 596K claims and 247K drug records seeded and queried live.',
  },
  {
    name: 'Drizzle ORM',
    role: 'Type-safe, SQL-close. AI writes better Drizzle than heavy ORMs \u2014 less abstraction means fewer hallucinated methods.',
  },
  {
    name: 'Recharts',
    role: 'Every chart in the dashboard. React-native, composable. AI generates reliable chart configs because the API surface is predictable.',
  },
  {
    name: 'shadcn/ui',
    role: 'Production-grade components without a design system. Consistent visual language across 4 dashboard views. Copy-paste architecture means AI can compose components without framework lock-in.',
  },
];

export function Toolkit() {
  return (
    <div className="space-y-6">
      {/* Enterprise framing */}
      <p className="text-muted-foreground text-sm leading-relaxed">
        This isn&rsquo;t a prototype. The stack was chosen to be deployable today &mdash; Vercel for
        zero-config production hosting, Postgres for real relational data at scale, Next.js for the
        same framework Fortune 500 companies ship on. Multi-entity architecture is already in the
        schema. Onboarding Pharmacy B is a CSV upload, not a rebuild. Every tool was also chosen for
        AI compatibility &mdash; lightweight, well-documented, and predictable enough that
        AI-generated code works on the first pass.
      </p>

      {/* Streamlit contrast callout */}
      <div className="rounded-md border-l-4 border-teal-400 bg-teal-50/50 py-3 pr-4 pl-4">
        <p className="text-foreground mb-1 text-sm font-semibold">
          Why not Streamlit or static HTML?
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          A notebook or single HTML file works for one-time analysis. It doesn&rsquo;t work for a
          second client, a second analyst, or a Monday morning deploy. We chose the stack a real
          engineering team would inherit &mdash; server-side aggregation so raw data never hits the
          browser, typed API contracts so the frontend and backend can evolve independently, and a
          deployment pipeline that ships preview URLs on every git push.
        </p>
      </div>

      {/* Tool grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.name} className="py-4">
            <CardHeader className="px-4 pb-1">
              <CardTitle className="text-sm font-bold tracking-tight">{tool.name}</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <p className="text-muted-foreground text-sm leading-snug">{tool.role}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
