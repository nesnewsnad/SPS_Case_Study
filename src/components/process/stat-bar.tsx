const stats = [
  { value: '4', label: 'Build Days' },
  { value: '4', label: 'Anomalies Detected' },
  { value: '5', label: 'Specs Written' },
  { value: '~65', label: 'Acceptance Criteria' },
  { value: '~8', label: 'Sessions with Full Continuity' },
];

export function StatBar() {
  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card relative flex items-baseline gap-2 overflow-hidden rounded-lg border px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]"
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-teal-400 to-teal-600" />
          <span className="font-mono text-2xl font-bold tracking-tight text-teal-700">
            {stat.value}
          </span>
          <span className="text-muted-foreground text-sm">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
