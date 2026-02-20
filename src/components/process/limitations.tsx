const limitations = [
  {
    title: 'Context Window is Real',
    description:
      'AI loses coherence on long sessions. That\u2019s why session logs and .continue-here.md exist \u2014 not because the workflow is elegant, but because without them, session #8 has no idea what session #1 decided.',
  },
  {
    title: 'AI Doesn\u2019t Know When It\u2019s Wrong',
    description:
      'It will confidently generate a chart that looks right with wrong data. Writer/reviewer separation exists because self-review doesn\u2019t catch what fresh-context review catches.',
  },
  {
    title: 'Domain Knowledge is Borrowed',
    description:
      'I\u2019m not a PBM analyst. AI helped me speak the language \u2014 MONY codes, NDC joins, LTC cycle fills \u2014 but every finding was verified against the raw data, not trusted from a prompt.',
  },
  {
    title: 'The Process Has Overhead',
    description:
      'Writing specs for a 4-day project feels like overkill. It\u2019s not. Two bugs were caught at spec-check that would have taken longer to fix in code than to prevent on paper.',
  },
];

export function Limitations() {
  return (
    <div className="space-y-4">
      {limitations.map((item) => (
        <div
          key={item.title}
          className="rounded-md border-l-4 border-amber-400 bg-amber-50/40 py-3 pr-4 pl-4"
        >
          <p className="text-foreground mb-1 text-sm font-semibold">{item.title}</p>
          <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
