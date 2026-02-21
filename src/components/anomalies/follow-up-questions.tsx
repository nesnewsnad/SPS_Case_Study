'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CLIENT_QUESTIONS = [
  {
    q: 'Is Kryptonite XR (NDC 65862020190) a known test record? Should it be permanently excluded?',
    context:
      'This fictional drug accounts for 8.3% of all claims and makes May an entirely synthetic month. Confirming its status determines whether we filter it from all standard reporting.',
  },
  {
    q: 'What caused the Kansas batch reversal event in August 2021? Was there a system migration or billing correction?',
    context:
      '18 Kansas groups with "400xxx" prefix show 100% reversal in August, then re-incur in September — a classic batch reversal and rebill pattern.',
  },
  {
    q: 'Was there a known operational event in September 2021 that would explain a 41% uniform volume increase?',
    context:
      'The spike is perfectly uniform across all states (40-42% increase) and formulary types — suggesting a systemic cause rather than a single group or drug.',
  },
  {
    q: 'Is the November volume dip (~54% below normal) expected, or does it indicate a data extract issue?',
    context:
      'All 30 days are present and all 183 active groups are present. The volume reduction is uniform across every dimension.',
  },
  {
    q: 'Are there additional data dimensions (cost, patient demographics, diagnosis codes) that could enrich this analysis?',
    context:
      'Current data covers utilization only. Adding cost, patient-level, and clinical data would unlock pricing analysis, adherence metrics, and intervention targeting.',
  },
];

const INTERNAL_QUESTIONS = [
  {
    q: 'Should flagged/test NDCs be automatically excluded from all standard reporting, or configurable per client?',
    context:
      'A global exclusion is simpler but less flexible. Per-client configuration adds complexity but supports different data quality scenarios.',
  },
  {
    q: 'How should batch reversal events be normalized for trend analysis — exclude the reversal month, or spread the volume adjustment across the rebill window?',
    context:
      'Excluding August for KS groups gives clean trends but loses information. Spreading the adjustment preserves the timeline but requires custom logic.',
  },
  {
    q: 'What is the appropriate baseline period for anomaly detection — rolling 12-month, same-month-prior-year, or peer group comparison?',
    context:
      'With only one year of data, same-month-prior-year is impossible. Rolling averages are sensitive to within-year anomalies.',
  },
  {
    q: 'Should the September spike be flagged as a data quality issue or accepted as legitimate volume variation?',
    context:
      'The spike is partially explained by KS rebill groups, but ~23,000 excess claims remain unexplained. The answer affects trend normalization strategy.',
  },
  {
    q: 'What threshold should trigger automatic anomaly alerts (e.g., >2\u03C3 deviation from rolling average)?',
    context:
      'Setting thresholds too low generates noise; too high misses real issues. The right level depends on operational tolerance for false positives.',
  },
];

const DATA_REQUESTS = [
  {
    q: 'Claims cost/reimbursement data',
    context:
      'Enables pricing analysis, cost-per-claim trends, and formulary cost comparison. Combined with utilization data, this powers AWP vs. reimbursement spread analysis.',
  },
  {
    q: 'Patient-level identifiers (de-identified)',
    context:
      'Enables utilization patterns, polypharmacy detection, and adherence metrics. For LTC populations, this is critical for clinical intervention targeting.',
  },
  {
    q: 'Prior authorization and step therapy data',
    context:
      'Explains some reversal patterns and formulary management effectiveness. Helps distinguish administrative reversals from clinical ones.',
  },
  {
    q: 'Historical data (2019-2020)',
    context:
      'Enables year-over-year comparison and trend validation. Would confirm whether September spikes and November dips are recurring patterns.',
  },
  {
    q: 'Facility-level identifiers',
    context:
      'Distinguishes SNF vs. ALF vs. other LTC settings for benchmarking. Different facility types have fundamentally different utilization patterns.',
  },
];

function QuestionList({ items }: { items: { q: string; context: string }[] }) {
  return (
    <ol className="list-none space-y-4 pl-0">
      {items.map((item, i) => (
        <li
          key={i}
          className="group hover:border-border hover:bg-muted/30 flex gap-3.5 rounded-lg border border-transparent px-3 py-2.5 transition-colors"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-xs font-bold text-teal-700 shadow-sm">
            {i + 1}
          </span>
          <div className="min-w-0">
            <p className="text-sm leading-snug font-medium">{item.q}</p>
            <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">{item.context}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export const FollowUpQuestions = memo(function FollowUpQuestions() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
          <CardTitle>Follow-Up Questions &amp; Next Steps</CardTitle>
        </div>
        <p className="text-muted-foreground text-sm">
          Structured questions derived from the data findings above
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="client">
          <TabsList className="mb-5">
            <TabsTrigger value="client">Client Questions</TabsTrigger>
            <TabsTrigger value="internal">Internal Team</TabsTrigger>
            <TabsTrigger value="data">Data Requests</TabsTrigger>
          </TabsList>
          <TabsContent value="client">
            <QuestionList items={CLIENT_QUESTIONS} />
          </TabsContent>
          <TabsContent value="internal">
            <QuestionList items={INTERNAL_QUESTIONS} />
          </TabsContent>
          <TabsContent value="data">
            <QuestionList items={DATA_REQUESTS} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});
