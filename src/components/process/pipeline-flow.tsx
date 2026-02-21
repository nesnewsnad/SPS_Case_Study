import { ChevronRight } from 'lucide-react';

const stages = [
  {
    number: 1,
    name: 'Research',
    description:
      'Data profiling, EDA, 69 pytest contracts. Codify every finding into CLAUDE.md before writing a single spec.',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    circle: 'bg-teal-100 text-teal-700',
    arrow: 'text-teal-300',
  },
  {
    number: 2,
    name: 'Discuss',
    description:
      'Lock design decisions before specs exist. Narrow the solution space so AI can\u2019t wander into arbitrary choices.',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    circle: 'bg-teal-200 text-teal-800',
    arrow: 'text-teal-300',
  },
  {
    number: 3,
    name: 'Spec',
    description:
      'Behavior contracts with measurable acceptance criteria. Every feature starts as a written spec before code exists.',
    bg: 'bg-teal-100/60',
    border: 'border-teal-300',
    circle: 'bg-teal-300 text-teal-900',
    arrow: 'text-teal-400',
  },
  {
    number: 4,
    name: 'Spec-Check',
    description:
      'Readiness gate. Tighten subjective ACs into testable ones. Nothing proceeds to code until the spec passes.',
    bg: 'bg-teal-100',
    border: 'border-teal-300',
    circle: 'bg-teal-400 text-white',
    arrow: 'text-teal-400',
  },
  {
    number: 5,
    name: 'Implement',
    description:
      'Dual-machine build. The machine that writes code is separate from the machine that wrote the spec.',
    bg: 'bg-teal-200/60',
    border: 'border-teal-400',
    circle: 'bg-teal-500 text-white',
    arrow: 'text-teal-500',
  },
  {
    number: 6,
    name: 'Verify',
    description:
      'Goal-backward testing. Every AC checked individually with evidence. Fresh context window, no familiarity bias.',
    bg: 'bg-teal-200',
    border: 'border-teal-400',
    circle: 'bg-teal-600 text-white',
    arrow: 'text-teal-500',
  },
  {
    number: 7,
    name: 'Ship',
    description:
      'Session log, checkpoint, context persists. Every session\u2019s output becomes the next session\u2019s input.',
    bg: 'bg-teal-300/60',
    border: 'border-teal-500',
    circle: 'bg-teal-700 text-white',
    arrow: '',
  },
];

export function PipelineFlow() {
  return (
    <div className="flex snap-x snap-mandatory items-stretch gap-0 overflow-x-auto pb-2 md:snap-none md:overflow-x-visible md:pb-0">
      {stages.map((stage, i) => (
        <div key={stage.number} className="flex shrink-0 snap-start items-stretch md:shrink">
          <div
            className={`${stage.bg} ${stage.border} flex min-w-[160px] flex-1 flex-col rounded-lg border p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] transition-shadow duration-200 hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] md:min-w-[140px]`}
          >
            <div className="mb-2 flex items-center gap-2.5">
              <span
                className={`${stage.circle} flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm`}
              >
                {stage.number}
              </span>
              <span className="font-bold tracking-tight">{stage.name}</span>
            </div>
            <p className="text-muted-foreground text-sm leading-snug">{stage.description}</p>
          </div>
          {i < stages.length - 1 && (
            <div className={`${stage.arrow} flex items-center px-1.5`}>
              <ChevronRight className="h-5 w-5" strokeWidth={3} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
