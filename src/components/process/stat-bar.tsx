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
          className="bg-card flex items-baseline gap-2 rounded-lg border px-4 py-3 shadow-sm"
        >
          <span className="font-mono text-xl font-bold">{stat.value}</span>
          <span className="text-muted-foreground text-sm">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
