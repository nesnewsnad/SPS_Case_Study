import { StatBar } from '@/components/process/stat-bar';
import { PipelineFlow } from '@/components/process/pipeline-flow';
import { ContextLayer } from '@/components/process/context-layer';
import { ArtifactEvidence } from '@/components/process/artifact-evidence';
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
        <h1 className="text-2xl font-bold tracking-tight">AI Process</h1>
        <p className="text-muted-foreground text-sm">
          How one person with a system built a production analytics platform in four days.
        </p>
        <div className="mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-teal-400 to-teal-600" />
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
        <SectionHeader>The System</SectionHeader>

        {/* Pipeline */}
        <div className="overflow-x-auto">
          <PipelineFlow />
        </div>

        {/* Pipeline quote */}
        <div className="rounded-r border-l-4 border-teal-300 bg-teal-50/30 px-4 py-3">
          <p className="text-muted-foreground text-sm leading-relaxed italic">
            Every feature followed this pipeline. No exceptions. The discipline is the point &mdash;
            it&rsquo;s what makes AI output reliable instead of lucky.
          </p>
        </div>

        {/* Context management layer */}
        <ContextLayer />
      </section>

      {/* Section 3: Artifact Evidence */}
      <section className="space-y-4 border-t pt-8">
        <SectionHeader>Artifact Evidence</SectionHeader>
        <ArtifactEvidence />
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
    </div>
  );
}
