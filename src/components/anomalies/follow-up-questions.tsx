'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CLIENT_QUESTIONS = [
  {
    q: 'Can you confirm Kryptonite XR (NDC 65862020190) is a QA test record? We\u2019ve excluded it from all reporting \u2014 are there additional test NDCs we should flag?',
    context:
      'This fictional drug accounts for 8.3% of all claims, inflates brand share by 7 percentage points, and makes May an entirely synthetic month. We\u2019ve already isolated it with a toggle in the dashboard.',
  },
  {
    q: 'The 18 Kansas \u201C400xxx\u201D groups show a clean July\u2192August\u2192September reversal-and-rebill cycle \u2014 was this a system migration, billing platform switch, or MCO contract change?',
    context:
      '100% reversal in August with zero new incurred, then re-incur in September at ~1.4x normal volume. The pattern is isolated to these 18 groups \u2014 all other KS groups have normal ~10% reversal rates.',
  },
  {
    q: 'The September spike is perfectly uniform across all states and formularies, which rules out any single group or drug as the driver \u2014 what systemic event produced it?',
    context:
      'All 5 states up 40-42%, all 3 formularies up 41-42%. KS rebill groups explain ~2,700 claims, but ~23,000 excess remain. September 2021 coincided with the Delta variant peak and the start of COVID booster campaigns for LTC residents.',
  },
  {
    q: 'November is uniformly half-volume across every dimension \u2014 is this a data extract boundary, or did an operational disruption (CMS mandate, staffing) reduce real volume?',
    context:
      'All 30 days are present and all 183 active groups are present. The distinction matters: a data issue means our baseline is wrong, a real disruption means November is a valid data point. November 2021 saw the CMS vaccine mandate publication (Nov 5), peak Great Resignation impact, and the emergence of the Omicron variant (Nov 24).',
  },
  {
    q: 'Are there additional data dimensions (cost, patient demographics, diagnosis codes) that could enrich this analysis?',
    context:
      'Current data covers utilization only. Adding cost, patient-level, and clinical data would unlock pricing analysis, adherence metrics, and intervention targeting.',
  },
];

const INTERNAL_QUESTIONS = [
  {
    q: 'Given that Kryptonite inflates brand share by 7 points and creates a fake month, should test NDC exclusion be automatic with per-client override, or fully configurable?',
    context:
      'A global exclusion is simpler and prevents downstream errors. Per-client configuration adds complexity but supports different data quality scenarios across the book of business.',
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
    q: 'The September spike\u2019s uniformity points to a real operational driver rather than data corruption \u2014 should we classify it as legitimate variation pending client confirmation?',
    context:
      'KS rebill groups explain ~2,700 claims, but ~23,000 excess remain uniformly distributed. The classification determines whether September becomes part of the trend baseline or gets normalized out.',
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
