import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { parseFilters } from '@/lib/parse-filters';
import { FLAGGED_NDCS } from '@/lib/api-types';
import type { AnomaliesResponse, AnomalyPanel } from '@/lib/api-types';

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

function pct(n: number): string {
  return n.toFixed(1) + '%';
}

export async function GET(request: NextRequest) {
  try {
    const filters = parseFilters(request.nextUrl.searchParams);
    const entityId = filters.entityId;
    const flaggedNdc = FLAGGED_NDCS[0].ndc;

    // ----------------------------------------------------------------
    // Panel 1: Kryptonite XR — always computed both ways
    // ----------------------------------------------------------------

    const [
      kryptoniteMonthly,
      metricsWithFlagged,
      metricsWithoutFlagged,
      mayWithFlagged,
      mayWithoutFlagged,
    ] = await Promise.all([
      // Monthly Kryptonite-only claims
      db.execute(sql`
        SELECT
          TO_CHAR(c.date_filled, 'YYYY-MM') AS month,
          COUNT(*)::int AS claims
        FROM claims c
        WHERE c.entity_id = ${entityId} AND c.ndc = ${flaggedNdc}
        GROUP BY TO_CHAR(c.date_filled, 'YYYY-MM')
        ORDER BY month
      `),
      // Metrics WITH flagged
      db.execute(sql`
        SELECT
          COUNT(*)::int AS total_claims,
          COALESCE(SUM(c.net_claim_count), 0)::int AS net_claims,
          ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS reversal_rate,
          COUNT(DISTINCT c.ndc)::int AS unique_drugs
        FROM claims c
        WHERE c.entity_id = ${entityId}
      `),
      // Metrics WITHOUT flagged
      db.execute(sql`
        SELECT
          COUNT(*)::int AS total_claims,
          COALESCE(SUM(c.net_claim_count), 0)::int AS net_claims,
          ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS reversal_rate,
          COUNT(DISTINCT c.ndc)::int AS unique_drugs
        FROM claims c
        WHERE c.entity_id = ${entityId} AND c.ndc != ${flaggedNdc}
      `),
      // May volume WITH flagged
      db.execute(sql`
        SELECT COUNT(*)::int AS may_vol
        FROM claims c
        WHERE c.entity_id = ${entityId}
          AND c.date_filled >= '2021-05-01' AND c.date_filled < '2021-06-01'
      `),
      // May volume WITHOUT flagged
      db.execute(sql`
        SELECT COUNT(*)::int AS may_vol
        FROM claims c
        WHERE c.entity_id = ${entityId} AND c.ndc != ${flaggedNdc}
          AND c.date_filled >= '2021-05-01' AND c.date_filled < '2021-06-01'
      `),
    ]);

    const wf = metricsWithFlagged.rows[0] as Record<string, unknown>;
    const wof = metricsWithoutFlagged.rows[0] as Record<string, unknown>;
    const mayWf = mayWithFlagged.rows[0] as Record<string, unknown>;
    const mayWof = mayWithoutFlagged.rows[0] as Record<string, unknown>;

    const kryptonitePanel: AnomalyPanel = {
      id: 'kryptonite-xr',
      title: 'Kryptonite XR — Synthetic Test Drug',
      keyStat: '49,567 claims',
      whatWeSee:
        "NDC 65862020190 ('KRYPTONITE XR' by LEX LUTHER INC.) accounts for 49,567 claims (8.3% of the dataset). 99.5% of these claims are concentrated in May, making May effectively a synthetic month.",
      whyItMatters:
        'This is almost certainly a test/dummy drug injected into the dataset. If not identified, it inflates May volume by ~20x and skews monthly trends, reversal rates, and drug mix analysis.',
      toConfirm:
        'Is this a known test record? Should it be permanently excluded from production reporting?',
      rfpImpact:
        'Demonstrates data quality detection capability. Any analytics vendor that reports May as a real peak month has failed a basic data integrity check.',
      beforeAfter: [
        {
          metric: 'Total Claims',
          withFlagged: fmt(Number(wf.total_claims)),
          withoutFlagged: fmt(Number(wof.total_claims)),
        },
        {
          metric: 'May Volume',
          withFlagged: fmt(Number(mayWf.may_vol)),
          withoutFlagged: fmt(Number(mayWof.may_vol)),
        },
        {
          metric: 'Net Claims',
          withFlagged: fmt(Number(wf.net_claims)),
          withoutFlagged: fmt(Number(wof.net_claims)),
        },
        {
          metric: 'Reversal Rate',
          withFlagged: pct(Number(wf.reversal_rate)),
          withoutFlagged: pct(Number(wof.reversal_rate)),
        },
        {
          metric: 'Unique Drugs',
          withFlagged: fmt(Number(wf.unique_drugs)),
          withoutFlagged: fmt(Number(wof.unique_drugs)),
        },
      ],
      miniCharts: [
        {
          title: 'Kryptonite XR Monthly Claims',
          type: 'bar',
          data: (kryptoniteMonthly.rows as Record<string, unknown>[]).map((r) => ({
            month: String(r.month),
            claims: Number(r.claims),
          })),
        },
      ],
    };

    // ----------------------------------------------------------------
    // Shared data for Sept/Nov panels: monthly totals excl Kryptonite
    // ----------------------------------------------------------------

    const [monthlyTotals, septByState, septByFormulary, novByState] = await Promise.all([
      db.execute(sql`
        SELECT
          TO_CHAR(c.date_filled, 'YYYY-MM') AS month,
          COUNT(*)::int AS total
        FROM claims c
        WHERE c.entity_id = ${entityId} AND c.ndc != ${flaggedNdc}
        GROUP BY TO_CHAR(c.date_filled, 'YYYY-MM')
        ORDER BY month
      `),
      // September claims by state
      db.execute(sql`
        SELECT
          c.pharmacy_state AS state,
          COUNT(*)::int AS september
        FROM claims c
        WHERE c.entity_id = ${entityId} AND c.ndc != ${flaggedNdc}
          AND c.date_filled >= '2021-09-01' AND c.date_filled < '2021-10-01'
        GROUP BY c.pharmacy_state
        ORDER BY c.pharmacy_state
      `),
      // September claims by formulary
      db.execute(sql`
        SELECT
          c.formulary AS formulary,
          COUNT(*)::int AS september
        FROM claims c
        WHERE c.entity_id = ${entityId} AND c.ndc != ${flaggedNdc}
          AND c.date_filled >= '2021-09-01' AND c.date_filled < '2021-10-01'
        GROUP BY c.formulary
        ORDER BY c.formulary
      `),
      // November claims by state
      db.execute(sql`
        SELECT
          c.pharmacy_state AS state,
          COUNT(*)::int AS november
        FROM claims c
        WHERE c.entity_id = ${entityId} AND c.ndc != ${flaggedNdc}
          AND c.date_filled >= '2021-11-01' AND c.date_filled < '2021-12-01'
        GROUP BY c.pharmacy_state
        ORDER BY c.pharmacy_state
      `),
    ]);

    // Compute averages by state and formulary (excl Kryptonite, all months)
    const [avgByState, avgByFormulary] = await Promise.all([
      db.execute(sql`
        SELECT
          c.pharmacy_state AS state,
          ROUND(COUNT(*)::numeric / 12, 0)::int AS average
        FROM claims c
        WHERE c.entity_id = ${entityId} AND c.ndc != ${flaggedNdc}
        GROUP BY c.pharmacy_state
        ORDER BY c.pharmacy_state
      `),
      db.execute(sql`
        SELECT
          c.formulary AS formulary,
          ROUND(COUNT(*)::numeric / 12, 0)::int AS average
        FROM claims c
        WHERE c.entity_id = ${entityId} AND c.ndc != ${flaggedNdc}
        GROUP BY c.formulary
        ORDER BY c.formulary
      `),
    ]);

    const monthlyRows = monthlyTotals.rows as Record<string, unknown>[];

    // Normal-month average (exclude May, September, and November)
    const normalMonths = monthlyRows.filter(
      (r) =>
        String(r.month) !== '2021-05' &&
        String(r.month) !== '2021-09' &&
        String(r.month) !== '2021-11',
    );
    const normalAvg =
      normalMonths.reduce((sum, r) => sum + Number(r.total), 0) / normalMonths.length;

    const septTotal = monthlyRows.find((r) => String(r.month) === '2021-09');
    const septCount = septTotal ? Number(septTotal.total) : 0;
    const septPct = Math.round(((septCount - normalAvg) / normalAvg) * 100);

    const novTotal = monthlyRows.find((r) => String(r.month) === '2021-11');
    const novCount = novTotal ? Number(novTotal.total) : 0;
    const novPct = Math.round(((novCount - normalAvg) / normalAvg) * 100);

    // Build state average lookup
    const stateAvgMap = new Map(
      (avgByState.rows as Record<string, unknown>[]).map((r) => [
        String(r.state),
        Number(r.average),
      ]),
    );

    // Build formulary average lookup
    const formularyAvgMap = new Map(
      (avgByFormulary.rows as Record<string, unknown>[]).map((r) => [
        String(r.formulary),
        Number(r.average),
      ]),
    );

    // ----------------------------------------------------------------
    // Panel 2: September Spike
    // ----------------------------------------------------------------

    // Compute September state/formulary pct ranges dynamically
    const septStateRanges = (septByState.rows as Record<string, unknown>[]).map((r) => {
      const avg = stateAvgMap.get(String(r.state)) ?? 1;
      return Math.round(((Number(r.september) - avg) / avg) * 100);
    });
    const septStateMin = Math.min(...septStateRanges);
    const septStateMax = Math.max(...septStateRanges);

    const septFormularyRanges = (septByFormulary.rows as Record<string, unknown>[]).map((r) => {
      const avg = formularyAvgMap.get(String(r.formulary)) ?? 1;
      return Math.round(((Number(r.september) - avg) / avg) * 100);
    });
    const septFormMin = Math.min(...septFormularyRanges);
    const septFormMax = Math.max(...septFormularyRanges);

    const septSpikePanel: AnomalyPanel = {
      id: 'sept-spike',
      title: 'September Volume Spike',
      keyStat: `+${septPct}%`,
      whatWeSee: `September 2021 saw ~${fmt(septCount)} claims (excluding Kryptonite), approximately ${septPct}% above the normal monthly average. The spike is remarkably uniform — all 5 states increased ${septStateMin}-${septStateMax}%, all 3 formulary types increased ${septFormMin}-${septFormMax}%.`,
      whyItMatters:
        'A uniform spike across all dimensions suggests a systemic cause — not a single group, drug, or state driving the increase. The KS batch rebill (re-incurring ~2,700 claims) partially explains the spike, but ~23,000 excess claims remain unexplained.',
      toConfirm:
        'Was there a Q3-end processing catch-up, LTC facility re-enrollment cycle, or known system event in September 2021?',
      rfpImpact:
        'Highlights the need for seasonal normalization in trend analysis and capacity planning.',
      miniCharts: [
        {
          title: 'Monthly Claims Volume (excl. Kryptonite)',
          type: 'bar',
          data: monthlyRows.map((r) => ({
            month: String(r.month),
            total: Number(r.total),
          })),
        },
        {
          title: 'September Claims by State',
          type: 'grouped-bar',
          data: (septByState.rows as Record<string, unknown>[]).map((r) => ({
            state: String(r.state),
            september: Number(r.september),
            average: stateAvgMap.get(String(r.state)) ?? 0,
          })),
        },
        {
          title: 'September Claims by Formulary',
          type: 'stacked-bar',
          data: (septByFormulary.rows as Record<string, unknown>[]).map((r) => ({
            formulary: String(r.formulary),
            september: Number(r.september),
            average: formularyAvgMap.get(String(r.formulary)) ?? 0,
          })),
        },
      ],
    };

    // ----------------------------------------------------------------
    // Panel 3: November Dip
    // ----------------------------------------------------------------

    const novDipPanel: AnomalyPanel = {
      id: 'nov-dip',
      title: 'November Volume Dip',
      keyStat: `${novPct}%`,
      whatWeSee: `November 2021 had only ~${fmt(novCount)} claims (excluding Kryptonite), approximately ${Math.abs(novPct)}% below the normal monthly average. All 30 days are present, and all ~183 active groups are present — this is not a data gap.`,
      whyItMatters: (() => {
        const novStateRanges = (novByState.rows as Record<string, unknown>[]).map((r) => {
          const avg = stateAvgMap.get(String(r.state)) ?? 1;
          return Math.round(Math.abs(((Number(r.november) - avg) / avg) * 100));
        });
        const novStateMin = Math.min(...novStateRanges);
        const novStateMax = Math.max(...novStateRanges);
        return `The dip is perfectly uniform across all states (${novStateMin}-${novStateMax}% below normal) and all groups. This rules out a single facility closure or regional event as the cause.`;
      })(),
      toConfirm:
        'Was there a known reduction in LTC admissions, a data extract issue, or a processing delay affecting November 2021?',
      rfpImpact:
        'Understanding this dip is critical for accurate year-over-year comparisons and forecasting.',
      miniCharts: [
        {
          title: 'Monthly Claims Volume (excl. Kryptonite)',
          type: 'bar',
          data: monthlyRows.map((r) => ({
            month: String(r.month),
            total: Number(r.total),
          })),
        },
        {
          title: 'November Claims by State',
          type: 'grouped-bar',
          data: (novByState.rows as Record<string, unknown>[]).map((r) => ({
            state: String(r.state),
            november: Number(r.november),
            average: stateAvgMap.get(String(r.state)) ?? 0,
          })),
        },
      ],
    };

    // ----------------------------------------------------------------
    // Panel 4: Kansas August Batch Reversal
    // ----------------------------------------------------------------

    const [ksMonthlyReversals, batchReversalGroups] = await Promise.all([
      // KS monthly reversal rates
      db.execute(sql`
        SELECT
          TO_CHAR(c.date_filled, 'YYYY-MM') AS month,
          ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS reversal_rate
        FROM claims c
        WHERE c.entity_id = ${entityId} AND c.ndc != ${flaggedNdc}
          AND c.pharmacy_state = 'KS'
        GROUP BY TO_CHAR(c.date_filled, 'YYYY-MM')
        ORDER BY month
      `),
      // Top 5 batch-reversal groups: KS groups with 0 incurred in August
      db.execute(sql`
        WITH aug_groups AS (
          SELECT c.group_id
          FROM claims c
          WHERE c.entity_id = ${entityId}
            AND c.pharmacy_state = 'KS'
            AND c.date_filled >= '2021-08-01' AND c.date_filled < '2021-09-01'
          GROUP BY c.group_id
          HAVING COUNT(*) FILTER (WHERE c.net_claim_count = 1) = 0
          ORDER BY COUNT(*) DESC
          LIMIT 5
        )
        SELECT
          c.group_id AS group_id,
          TO_CHAR(c.date_filled, 'YYYY-MM') AS month,
          COUNT(*)::int AS total
        FROM claims c
        WHERE c.entity_id = ${entityId}
          AND c.group_id IN (SELECT group_id FROM aug_groups)
          AND c.date_filled >= '2021-07-01' AND c.date_filled < '2021-10-01'
        GROUP BY c.group_id, TO_CHAR(c.date_filled, 'YYYY-MM')
        ORDER BY c.group_id, month
      `),
    ]);

    // Pivot batch reversal group data into {group, jul, aug, sep}
    const groupMap = new Map<string, { jul: number; aug: number; sep: number }>();
    for (const r of batchReversalGroups.rows as Record<string, unknown>[]) {
      const gid = String(r.group_id);
      if (!groupMap.has(gid)) groupMap.set(gid, { jul: 0, aug: 0, sep: 0 });
      const entry = groupMap.get(gid)!;
      const m = String(r.month);
      if (m === '2021-07') entry.jul = Number(r.total);
      else if (m === '2021-08') entry.aug = Number(r.total);
      else if (m === '2021-09') entry.sep = Number(r.total);
    }

    const ksAugPanel: AnomalyPanel = {
      id: 'ks-aug-batch-reversal',
      title: 'Kansas August Batch Reversal',
      keyStat: '81.6%',
      whatWeSee:
        "Kansas August shows 6,029 total rows with an 81.6% reversal rate. Root cause: 18 KS-only groups (all with '400xxx' prefix) have 100% reversal and zero incurred claims in August (4,790 rows). These groups show normal activity in July (~10% reversal), full reversal in August, then re-incur in September at ~1.4x normal volume.",
      whyItMatters:
        "This is a classic batch reversal and rebill pattern — July claims were reversed in August and re-submitted in September. Kansas's elevated annual reversal rate (15.8%) is entirely an artifact of this single August event. Excluding August, KS has a normal ~10% reversal rate.",
      toConfirm:
        'Was there a known system migration, billing correction, or contract renegotiation affecting these 18 Kansas groups in August 2021?',
      rfpImpact:
        "Proper identification of batch reversal events prevents mischaracterizing an entire state's claims performance.",
      miniCharts: [
        {
          title: 'Kansas Monthly Reversal Rate',
          type: 'bar',
          data: (ksMonthlyReversals.rows as Record<string, unknown>[]).map((r) => ({
            month: String(r.month),
            reversalRate: Number(r.reversal_rate),
          })),
        },
        {
          title: 'Batch Reversal Groups — Jul/Aug/Sep Pattern',
          type: 'grouped-bar',
          data: Array.from(groupMap.entries()).map(([gid, vals]) => ({
            group: gid,
            jul: vals.jul,
            aug: vals.aug,
            sep: vals.sep,
          })),
        },
      ],
    };

    // ----------------------------------------------------------------
    // Panel 5: Day-of-Month Cycle Fill Pattern
    // Panel 6: Semi-Synthetic Data Characteristics
    // ----------------------------------------------------------------

    const [dayOfMonthVolume, formularyByState, adjByFormulary, revByFormulary] = await Promise.all([
      // Day-of-month volume (excl Kryptonite, May, November)
      db.execute(sql`
        SELECT
          EXTRACT(DAY FROM c.date_filled)::int AS day_of_month,
          COUNT(*)::int AS total
        FROM claims c
        WHERE c.entity_id = ${entityId} AND c.ndc != ${flaggedNdc}
          AND TO_CHAR(c.date_filled, 'YYYY-MM') NOT IN ('2021-05', '2021-11')
        GROUP BY EXTRACT(DAY FROM c.date_filled)::int
        ORDER BY day_of_month
      `),
      // Formulary distribution by state
      db.execute(sql`
        SELECT c.pharmacy_state AS state, c.formulary,
          ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER (PARTITION BY c.pharmacy_state) * 100, 1) AS pct
        FROM claims c
        WHERE c.entity_id = ${entityId} AND c.ndc != ${flaggedNdc}
        GROUP BY c.pharmacy_state, c.formulary
        ORDER BY c.pharmacy_state, c.formulary
      `),
      // Adjudication rate by formulary
      db.execute(sql`
        SELECT c.formulary,
          ROUND(COUNT(*) FILTER (WHERE c.adjudicated = true)::numeric / COUNT(*) * 100, 1) AS adj_rate
        FROM claims c
        WHERE c.entity_id = ${entityId} AND c.ndc != ${flaggedNdc}
        GROUP BY c.formulary
      `),
      // Reversal rate by formulary
      db.execute(sql`
        SELECT c.formulary,
          ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / COUNT(*) * 100, 1) AS rev_rate
        FROM claims c
        WHERE c.entity_id = ${entityId} AND c.ndc != ${flaggedNdc}
        GROUP BY c.formulary
      `),
    ]);

    // Cycle fill: compute day-1 and day-26 multiples
    const dayRows = dayOfMonthVolume.rows as Record<string, unknown>[];
    const totalVolume = dayRows.reduce((sum, r) => sum + Number(r.total), 0);
    const avgDailyVolume = totalVolume / dayRows.length;
    const day1Row = dayRows.find((r) => Number(r.day_of_month) === 1);
    const day26Row = dayRows.find((r) => Number(r.day_of_month) === 26);
    const day1Multiple = day1Row ? (Number(day1Row.total) / avgDailyVolume).toFixed(1) : '7.0';
    const day26Multiple = day26Row ? (Number(day26Row.total) / avgDailyVolume).toFixed(1) : '2.0';

    const cycleFillPanel: AnomalyPanel = {
      id: 'cycle-fill-pattern',
      title: 'Day-of-Month Cycle Fill Pattern',
      keyStat: `~${day1Multiple}× Day-1 Peak`,
      whatWeSee: `Day 1 of each month shows ~${day1Multiple}x average daily volume — the primary LTC cycle-fill peak. Day 26 shows a secondary peak at ~${day26Multiple}x average, likely a second cohort of facilities on an offset dispensing schedule. Together these two days account for a disproportionate share of monthly volume.`,
      whyItMatters:
        'Identifying dispensing cycles enables capacity planning, staffing optimization, and predictive ordering. The day-26 secondary peak suggests at least two distinct facility dispensing schedules within the network.',
      toConfirm:
        'Do specific facility groups drive the day-26 secondary peak? Is this a known alternate dispensing schedule?',
      rfpImpact:
        'Demonstrates granular pattern detection beyond monthly trends — shows we can identify operational rhythms in the data.',
      miniCharts: [
        {
          title: 'Claims by Day of Month',
          type: 'bar' as const,
          data: dayRows.map((r) => ({
            day: Number(r.day_of_month),
            total: Number(r.total),
          })),
        },
      ],
    };

    // Semi-synthetic: build grouped-bar data (formulary % by state)
    const formularyByStateRows = formularyByState.rows as Record<string, unknown>[];
    // Pivot into {state, OPEN, MANAGED, HMF}
    const stateFormMap = new Map<string, Record<string, number>>();
    for (const r of formularyByStateRows) {
      const st = String(r.state);
      if (!stateFormMap.has(st)) stateFormMap.set(st, {});
      stateFormMap.get(st)![String(r.formulary)] = Number(r.pct);
    }

    // Build adjudication/reversal rate strings
    const adjRows = adjByFormulary.rows as Record<string, unknown>[];
    const revRows = revByFormulary.rows as Record<string, unknown>[];
    const adjRates = adjRows.map((r) => Number(r.adj_rate));
    const revRates = revRows.map((r) => Number(r.rev_rate));
    const avgAdj = adjRates.length
      ? (adjRates.reduce((a, b) => a + b, 0) / adjRates.length).toFixed(1)
      : '25.1';
    const avgRev = revRates.length
      ? (revRates.reduce((a, b) => a + b, 0) / revRates.length).toFixed(1)
      : '10.8';

    const semiSyntheticPanel: AnomalyPanel = {
      id: 'semi-synthetic-flags',
      title: 'Semi-Synthetic Data Characteristics',
      keyStat: `~${avgAdj}% / ~${avgRev}%`,
      whatWeSee: `Formulary, adjudication, and reversal distributions are perfectly uniform across all dimensions. Each state has nearly identical OPEN/MANAGED/HMF splits; adjudication rate is ~${avgAdj}% everywhere; reversal rate is ~${avgRev}% everywhere. In real PBM data, these would correlate with drug type, state regulations, and formulary tier.`,
      whyItMatters:
        'This strongly suggests the dataset is semi-synthetic — real utilization patterns (drugs, groups, states, dates) with randomly assigned categorical flags. This is important context for any conclusions drawn from formulary or adjudication analysis.',
      toConfirm:
        'Is this a known property of the test dataset? Were categorical flags randomized to anonymize the data?',
      rfpImpact:
        "Demonstrates deep data integrity analysis — catching that the data 'looks real but isn't quite' shows a level of scrutiny that goes beyond surface-level dashboarding.",
      miniCharts: [
        {
          title: 'Formulary Distribution by State (%)',
          type: 'grouped-bar' as const,
          data: Array.from(stateFormMap.entries()).map(([st, vals]) => ({
            state: st,
            OPEN: vals['OPEN'] ?? 0,
            MANAGED: vals['MANAGED'] ?? 0,
            HMF: vals['HMF'] ?? 0,
          })),
        },
      ],
    };

    // ----------------------------------------------------------------
    // Assemble response
    // ----------------------------------------------------------------

    const response: AnomaliesResponse = {
      panels: [
        kryptonitePanel,
        ksAugPanel,
        septSpikePanel,
        novDipPanel,
        cycleFillPanel,
        semiSyntheticPanel,
      ],
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('GET /api/anomalies error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
