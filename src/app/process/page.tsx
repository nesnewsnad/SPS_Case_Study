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
          Not lucky prompts. An engineering discipline that makes AI output reliable, verifiable,
          and repeatable.
        </p>
        <div className="mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-teal-400 to-teal-600" />
      </div>

      {/* Section 1: Hero Stat Bar + Hook */}
      <section className="space-y-4">
        <StatBar />
        <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
          Four anomalies in 596,000 rows of claims data. One was an easter egg &mdash; a test drug
          called Kryptonite&nbsp;XR injected by whoever built this dataset. Three required
          cross-dimensional analysis: an entire state&rsquo;s claims batch-reversed in a single
          month, a 41% volume spike with no identifiable cause, and a month with half the expected
          volume. The dashboard on the other three pages visualizes those findings. This page
          documents the system that made finding them inevitable &mdash; not lucky, not manual, but
          engineered.
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
          This system isn&rsquo;t specific to claims data or pharmacy analytics. It&rsquo;s a
          framework for making AI output reliable in any analytical domain &mdash; structured
          research, measurable specs, gated implementation, goal-backward verification, and
          persistent context across sessions. The process is the product.
        </p>
      </section>
    </div>
  );
}
