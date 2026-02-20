import { ChevronRight } from 'lucide-react';

const stages = [
  {
    number: 1,
    name: 'Research',
    description:
      'EDA, data profiling, discovery. 69 pytest data contracts codifying findings. Feed everything into CLAUDE.md.',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    circle: 'bg-teal-100 text-teal-700',
    arrow: 'text-teal-300',
  },
  {
    number: 2,
    name: 'Spec',
    description:
      'Problem statement, behavior definition, measurable acceptance criteria. Every feature starts as a written spec before code exists.',
    bg: 'bg-teal-100/60',
    border: 'border-teal-300',
    circle: 'bg-teal-200 text-teal-800',
    arrow: 'text-teal-400',
  },
  {
    number: 3,
    name: 'Spec-Check',
    description:
      'Readiness review. Tighten subjective ACs into testable ones. Add implementor notes for ambiguous areas. Gate: nothing proceeds to code until the spec passes.',
    bg: 'bg-teal-100',
    border: 'border-teal-300',
    circle: 'bg-teal-300 text-teal-900',
    arrow: 'text-teal-400',
  },
  {
    number: 4,
    name: 'Implement',
    description:
      'Dual-machine architecture. The machine that writes the code is separate from the machine that wrote the spec. Writer never verifies their own work.',
    bg: 'bg-teal-200/60',
    border: 'border-teal-400',
    circle: 'bg-teal-400 text-white',
    arrow: 'text-teal-500',
  },
  {
    number: 5,
    name: 'Verify',
    description:
      'Goal-backward verification. Every AC tested individually with evidence. "PASS 17/17" means 17 individual checks, not "it looks right."',
    bg: 'bg-teal-200',
    border: 'border-teal-400',
    circle: 'bg-teal-600 text-white',
    arrow: '',
  },
];

export function PipelineFlow() {
  return (
    <div className="flex snap-x snap-mandatory items-stretch gap-0 overflow-x-auto pb-2 md:snap-none md:overflow-x-visible md:pb-0">
      {stages.map((stage, i) => (
        <div key={stage.number} className="flex shrink-0 snap-start items-stretch md:shrink">
          <div
            className={`${stage.bg} ${stage.border} flex min-w-[200px] flex-1 flex-col rounded-lg border p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] transition-shadow duration-200 hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] md:min-w-[180px]`}
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
