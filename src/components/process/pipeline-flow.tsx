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
    <div className="flex items-stretch gap-0">
      {stages.map((stage, i) => (
        <div key={stage.number} className="flex items-stretch">
          <div
            className={`${stage.bg} ${stage.border} flex min-w-[180px] flex-1 flex-col rounded-lg border p-4`}
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`${stage.circle} flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold`}
              >
                {stage.number}
              </span>
              <span className="font-semibold">{stage.name}</span>
            </div>
            <p className="text-muted-foreground text-sm leading-snug">{stage.description}</p>
          </div>
          {i < stages.length - 1 && (
            <div className={`${stage.arrow} flex items-center px-1`}>
              <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
