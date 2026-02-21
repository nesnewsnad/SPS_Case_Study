import { StatBar } from '@/components/process/stat-bar';
import { PipelineFlow } from '@/components/process/pipeline-flow';
import { PipelineWalkthrough } from '@/components/process/pipeline-walkthrough';
import { ContextLayer } from '@/components/process/context-layer';
import { Toolkit } from '@/components/process/toolkit';
import { Limitations } from '@/components/process/limitations';

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
      {children}
    </h2>
  );
}

export default function ProcessPage() {
  return (
    <div className="stagger-children space-y-8 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          How One Person With a System Built This in Four Days
        </h1>
        <p className="text-muted-foreground text-sm">
          The same system that found four anomalies in this dataset is ready to deploy across SPS
          Health&rsquo;s analytics practice &mdash; claims, pricing, network, clinical.
        </p>
        <div className="mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-teal-400 to-teal-600" />
      </div>

      {/* Section 1: Hero Stat Bar + Hook */}
      <section className="space-y-4">
        <StatBar />
        <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
          SPS Health doesn&rsquo;t need an analyst who can build one dashboard. It needs someone who
          can bring a repeatable AI implementation process to every department that touches data.
          This case study is the proof of concept: four anomalies surfaced from 596,000 rows of
          claims data &mdash; an easter egg test drug that inflates brand share by 7 points, an
          entire state&rsquo;s claims batch-reversed in a single month, a 41% volume spike aligned
          with the Delta variant surge, and a month at half volume coinciding with the Omicron
          emergence and CMS vaccine mandate. The system that found them is documented below.
          It&rsquo;s the same system I&rsquo;d bring to SPS on day one.
        </p>
      </section>

      {/* Section 2: The System */}
      <section className="space-y-6">
        <SectionHeader>The System</SectionHeader>

        {/* Pipeline overview */}
        <div className="overflow-x-auto">
          <PipelineFlow />
        </div>

        {/* Transition to walkthrough */}
        <div className="rounded-r border-l-4 border-teal-300 bg-teal-50/30 px-4 py-3">
          <p className="text-muted-foreground text-sm leading-relaxed italic">
            Every feature followed this pipeline. Click any stage below to see what it produced for
            SPEC-005 &mdash; the Anomalies &amp; Recommendations page.
          </p>
        </div>

        {/* Interactive walkthrough */}
        <PipelineWalkthrough />
      </section>

      {/* Section 3: Context Layer */}
      <section className="space-y-4 border-t pt-8">
        <SectionHeader>Context Layer</SectionHeader>
        <p className="text-muted-foreground text-sm leading-relaxed italic">
          The pipeline works because context persists &mdash; between stages, between sessions, and
          between machines.
        </p>
        <ContextLayer />
      </section>

      {/* Section 4: The Toolkit */}
      <section className="space-y-4 border-t pt-8">
        <SectionHeader>The Toolkit</SectionHeader>
        <Toolkit />
      </section>

      {/* Section 5: Honest Limitations */}
      <section className="space-y-4 border-t pt-8">
        <SectionHeader>Honest Limitations</SectionHeader>
        <p className="text-muted-foreground text-sm leading-relaxed italic">
          AI is a force multiplier, not a replacement. Here&rsquo;s where it needed guardrails.
        </p>
        <Limitations />
      </section>

      {/* Section 6: Closing */}
      <section className="border-t pt-8">
        <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
          This system transfers. Pricing analysis, network adequacy reviews, clinical utilization
          audits, client onboarding analytics &mdash; every domain where SPS Health needs to move
          from raw data to defensible insight follows the same pipeline. Structured research,
          measurable specs, gated implementation, goal-backward verification. The dashboard you just
          explored is what one cycle produces. The process on this page is what makes the next cycle
          faster.
        </p>
      </section>
    </div>
  );
}
