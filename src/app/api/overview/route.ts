import { NextRequest, NextResponse } from 'next/server';
import { sql, SQL } from 'drizzle-orm';
import { db } from '@/db';
import { parseFilters } from '@/lib/parse-filters';
import { FLAGGED_NDCS } from '@/lib/api-types';
import type {
  OverviewResponse,
  KpiSummary,
  MonthlyDataPoint,
  FormularyBreakdown,
  StateBreakdown,
  AdjudicationSummary,
  FilterParams,
} from '@/lib/api-types';

function buildRawWhere(filters: FilterParams): { where: SQL; needsJoin: boolean } {
  const parts: SQL[] = [sql`c.entity_id = ${filters.entityId}`];
  let needsJoin = false;

  if (!filters.includeFlaggedNdcs && FLAGGED_NDCS.length > 0) {
    parts.push(
      sql`c.ndc NOT IN (${sql.join(
        FLAGGED_NDCS.map((f) => sql`${f.ndc}`),
        sql`, `,
      )})`,
    );
  }

  if (filters.formulary) parts.push(sql`c.formulary = ${filters.formulary}`);
  if (filters.state) parts.push(sql`c.pharmacy_state = ${filters.state}`);
  if (filters.groupId) parts.push(sql`c.group_id = ${filters.groupId}`);
  if (filters.ndc) parts.push(sql`c.ndc = ${filters.ndc}`);
  if (filters.dateStart) parts.push(sql`c.date_filled >= ${filters.dateStart}`);
  if (filters.dateEnd) parts.push(sql`c.date_filled <= ${filters.dateEnd}`);

  if (filters.mony) {
    needsJoin = true;
    parts.push(sql`d.mony = ${filters.mony}`);
  }
  if (filters.manufacturer) {
    needsJoin = true;
    parts.push(sql`d.manufacturer_name = ${filters.manufacturer}`);
  }
  if (filters.drug) {
    needsJoin = true;
    parts.push(sql`d.drug_name = ${filters.drug}`);
  }

  return { where: sql.join(parts, sql` AND `), needsJoin };
}

function buildBaselineWhere(filters: FilterParams): SQL {
  const parts: SQL[] = [sql`c.entity_id = ${filters.entityId}`];

  if (!filters.includeFlaggedNdcs && FLAGGED_NDCS.length > 0) {
    parts.push(
      sql`c.ndc NOT IN (${sql.join(
        FLAGGED_NDCS.map((f) => sql`${f.ndc}`),
        sql`, `,
      )})`,
    );
  }

  return sql.join(parts, sql` AND `);
}

// All filters EXCEPT state — used to always show all 5 states
function buildNoStateWhere(filters: FilterParams): { where: SQL; needsJoin: boolean } {
  const parts: SQL[] = [sql`c.entity_id = ${filters.entityId}`];
  let needsJoin = false;

  if (!filters.includeFlaggedNdcs && FLAGGED_NDCS.length > 0) {
    parts.push(
      sql`c.ndc NOT IN (${sql.join(
        FLAGGED_NDCS.map((f) => sql`${f.ndc}`),
        sql`, `,
      )})`,
    );
  }

  if (filters.formulary) parts.push(sql`c.formulary = ${filters.formulary}`);
  // state deliberately omitted
  if (filters.groupId) parts.push(sql`c.group_id = ${filters.groupId}`);
  if (filters.ndc) parts.push(sql`c.ndc = ${filters.ndc}`);
  if (filters.dateStart) parts.push(sql`c.date_filled >= ${filters.dateStart}`);
  if (filters.dateEnd) parts.push(sql`c.date_filled <= ${filters.dateEnd}`);

  if (filters.mony) { needsJoin = true; parts.push(sql`d.mony = ${filters.mony}`); }
  if (filters.manufacturer) { needsJoin = true; parts.push(sql`d.manufacturer_name = ${filters.manufacturer}`); }
  if (filters.drug) { needsJoin = true; parts.push(sql`d.drug_name = ${filters.drug}`); }

  return { where: sql.join(parts, sql` AND `), needsJoin };
}

export async function GET(request: NextRequest) {
  try {
    const filters = parseFilters(request.nextUrl.searchParams);
    const { where, needsJoin } = buildRawWhere(filters);
    const baselineWhere = buildBaselineWhere(filters);
    const { where: noStateWhere, needsJoin: noStateJoin } = buildNoStateWhere(filters);

    const fromClause = needsJoin
      ? sql`FROM claims c LEFT JOIN drug_info d ON c.ndc = d.ndc`
      : sql`FROM claims c`;

    const noStateFrom = noStateJoin
      ? sql`FROM claims c LEFT JOIN drug_info d ON c.ndc = d.ndc`
      : sql`FROM claims c`;

    const [kpiResult, unfilteredResult, monthlyResult, formularyResult, statesResult, allStatesResult, adjResult] =
      await Promise.all([
        db.execute(sql`
          SELECT
            COUNT(*)::int AS total_claims,
            COALESCE(SUM(c.net_claim_count), 0)::int AS net_claims,
            ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS reversal_rate,
            COUNT(DISTINCT c.ndc)::int AS unique_drugs
          ${fromClause}
          WHERE ${where}
        `),

        db.execute(sql`
          SELECT
            COUNT(*)::int AS total_claims,
            COALESCE(SUM(c.net_claim_count), 0)::int AS net_claims,
            ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS reversal_rate,
            COUNT(DISTINCT c.ndc)::int AS unique_drugs
          FROM claims c
          WHERE ${baselineWhere}
        `),

        db.execute(sql`
          SELECT
            to_char(c.date_filled, 'YYYY-MM') AS month,
            COUNT(*) FILTER (WHERE c.net_claim_count = 1)::int AS incurred,
            COUNT(*) FILTER (WHERE c.net_claim_count = -1)::int AS reversed
          ${fromClause}
          WHERE ${where}
          GROUP BY to_char(c.date_filled, 'YYYY-MM')
          ORDER BY month
        `),

        db.execute(sql`
          SELECT
            c.formulary AS type,
            COALESCE(SUM(c.net_claim_count), 0)::int AS net_claims,
            ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS reversal_rate
          ${fromClause}
          WHERE ${where}
          GROUP BY c.formulary
          ORDER BY net_claims DESC
        `),

        db.execute(sql`
          SELECT
            c.pharmacy_state AS state,
            COALESCE(SUM(c.net_claim_count), 0)::int AS net_claims,
            COUNT(*)::int AS total_claims,
            ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS reversal_rate
          ${fromClause}
          WHERE ${where}
          GROUP BY c.pharmacy_state
          ORDER BY net_claims DESC
        `),

        // All states (ignoring state filter) — for highlight-style bar chart
        db.execute(sql`
          SELECT
            c.pharmacy_state AS state,
            COALESCE(SUM(c.net_claim_count), 0)::int AS net_claims,
            COUNT(*)::int AS total_claims,
            ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS reversal_rate
          ${noStateFrom}
          WHERE ${noStateWhere}
          GROUP BY c.pharmacy_state
          ORDER BY net_claims DESC
        `),

        db.execute(sql`
          SELECT
            COUNT(*) FILTER (WHERE c.adjudicated = true)::int AS adjudicated,
            COUNT(*) FILTER (WHERE c.adjudicated = false)::int AS not_adjudicated,
            ROUND(COUNT(*) FILTER (WHERE c.adjudicated = true)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS rate
          ${fromClause}
          WHERE ${where}
        `),
      ]);

    const kpiRow = kpiResult.rows[0] as Record<string, unknown>;
    const kpis: KpiSummary = {
      totalClaims: Number(kpiRow.total_claims) || 0,
      netClaims: Number(kpiRow.net_claims) || 0,
      reversalRate: Number(kpiRow.reversal_rate) || 0,
      uniqueDrugs: Number(kpiRow.unique_drugs) || 0,
    };

    const unfilteredRow = unfilteredResult.rows[0] as Record<string, unknown>;
    const unfilteredKpis: KpiSummary = {
      totalClaims: Number(unfilteredRow.total_claims) || 0,
      netClaims: Number(unfilteredRow.net_claims) || 0,
      reversalRate: Number(unfilteredRow.reversal_rate) || 0,
      uniqueDrugs: Number(unfilteredRow.unique_drugs) || 0,
    };

    const monthly: MonthlyDataPoint[] = (monthlyResult.rows as Record<string, unknown>[]).map(
      (r) => ({
        month: String(r.month),
        incurred: Number(r.incurred) || 0,
        reversed: Number(r.reversed) || 0,
      }),
    );

    const formulary: FormularyBreakdown[] = (formularyResult.rows as Record<string, unknown>[]).map(
      (r) => ({
        type: String(r.type),
        netClaims: Number(r.net_claims) || 0,
        reversalRate: Number(r.reversal_rate) || 0,
      }),
    );

    const states: StateBreakdown[] = (statesResult.rows as Record<string, unknown>[]).map((r) => ({
      state: String(r.state),
      netClaims: Number(r.net_claims) || 0,
      totalClaims: Number(r.total_claims) || 0,
      reversalRate: Number(r.reversal_rate) || 0,
    }));

    const allStates: StateBreakdown[] = (allStatesResult.rows as Record<string, unknown>[]).map((r) => ({
      state: String(r.state),
      netClaims: Number(r.net_claims) || 0,
      totalClaims: Number(r.total_claims) || 0,
      reversalRate: Number(r.reversal_rate) || 0,
    }));

    const adjRow = adjResult.rows[0] as Record<string, unknown>;
    const adjudication: AdjudicationSummary = {
      adjudicated: Number(adjRow.adjudicated) || 0,
      notAdjudicated: Number(adjRow.not_adjudicated) || 0,
      rate: Number(adjRow.rate) || 0,
    };

    const response: OverviewResponse = {
      kpis,
      unfilteredKpis,
      monthly,
      formulary,
      states,
      allStates,
      adjudication,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('GET /api/overview error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
