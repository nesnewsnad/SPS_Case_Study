import { StatBar } from '@/components/process/stat-bar';
import { PipelineFlow } from '@/components/process/pipeline-flow';
import { ContextLayer } from '@/components/process/context-layer';
import { ArtifactEvidence } from '@/components/process/artifact-evidence';
import { Toolkit } from '@/components/process/toolkit';
import { Limitations } from '@/components/process/limitations';

export default function ProcessPage() {
  return (
    <div className="stagger-children space-y-8 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Process</h1>
        <p className="text-muted-foreground">
          How one person with a system built a production analytics platform in four days.
        </p>
      </div>

      {/* Section 1: Hero Stat Bar + Framing */}
      <section className="space-y-4">
        <StatBar />
        <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
          Four anomalies in 596,000 rows of claims data. Two are obvious &mdash; a test drug called
          Kryptonite XR isn&rsquo;t hard to spot. Two require cross-dimensional analysis that most
          manual reviews miss. All four were found by the same structured AI workflow &mdash; not
          lucky prompts, but an engineering system designed for repeatability, context preservation,
          and verification. This page documents that system.
        </p>
      </section>

      {/* Section 2: The System (centerpiece — most visual weight) */}
      <section className="space-y-8">
        <h2 className="text-lg font-semibold">The System</h2>

        {/* Pipeline */}
        <div className="overflow-x-auto">
          <PipelineFlow />
        </div>

        {/* Pipeline quote */}
        <p className="text-muted-foreground border-l-4 border-teal-300 pl-4 text-sm italic">
          Every feature followed this pipeline. No exceptions. The discipline is the point &mdash;
          it&rsquo;s what makes AI output reliable instead of lucky.
        </p>

        {/* Context management layer */}
        <ContextLayer />
      </section>

      {/* Section 3: Artifact Evidence */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Artifact Evidence</h2>
        <ArtifactEvidence />
      </section>

      {/* Section 4: The Toolkit */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">The Toolkit</h2>
        <Toolkit />
      </section>

      {/* Section 5: Honest Limitations */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Honest Limitations</h2>
        <p className="text-muted-foreground text-sm italic">
          AI is a force multiplier, not a replacement. Here&rsquo;s where it needed guardrails.
        </p>
        <Limitations />
      </section>
    </div>
  );
}
