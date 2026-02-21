import { NextRequest, NextResponse } from 'next/server';
import { sql, SQL } from 'drizzle-orm';
import { db } from '@/db';
import { parseFilters } from '@/lib/parse-filters';
import { FLAGGED_NDCS } from '@/lib/api-types';
import type {
  ClaimsResponse,
  KpiSummary,
  MonthlyDataPoint,
  DrugRow,
  DaysSupplyBin,
  MonyBreakdown,
  GroupVolume,
  ManufacturerVolume,
  FilterParams,
} from '@/lib/api-types';

function needsDrugJoin(filters: FilterParams): boolean {
  return !!(filters.mony || filters.manufacturer || filters.drug);
}

function buildWhere(filters: FilterParams): SQL {
  const parts: SQL[] = [sql`c.entity_id = ${filters.entityId}`];

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
  if (filters.mony) parts.push(sql`d.mony = ${filters.mony}`);
  if (filters.manufacturer) parts.push(sql`d.manufacturer_name = ${filters.manufacturer}`);
  if (filters.drug) parts.push(sql`d.drug_name = ${filters.drug}`);

  return sql.join(parts, sql` AND `);
}

function buildUnfilteredWhere(filters: FilterParams): SQL {
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

const FROM_CLAIMS = sql`claims c`;
const FROM_CLAIMS_JOIN_DRUG = sql`claims c LEFT JOIN drug_info d ON c.ndc = d.ndc`;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = parseFilters(searchParams);
    const limit = Number(searchParams.get('limit')) || 20;

    const where = buildWhere(filters);
    const unfilteredWhere = buildUnfilteredWhere(filters);
    const drugJoinNeeded = needsDrugJoin(filters);
    const fromForGeneral = drugJoinNeeded ? FROM_CLAIMS_JOIN_DRUG : FROM_CLAIMS;

    const [
      kpiResult,
      unfilteredKpiResult,
      monthlyResult,
      drugsResult,
      daysSupplyResult,
      monyResult,
      topGroupsResult,
      topManufacturersResult,
    ] = await Promise.all([
      db.execute(sql`
        SELECT
          COUNT(*)::int AS total_claims,
          COALESCE(SUM(c.net_claim_count), 0)::int AS net_claims,
          ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS reversal_rate,
          COUNT(DISTINCT c.ndc)::int AS unique_drugs
        FROM ${fromForGeneral}
        WHERE ${where}
      `),

      db.execute(sql`
        SELECT
          COUNT(*)::int AS total_claims,
          COALESCE(SUM(c.net_claim_count), 0)::int AS net_claims,
          ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS reversal_rate,
          COUNT(DISTINCT c.ndc)::int AS unique_drugs
        FROM ${FROM_CLAIMS}
        WHERE ${unfilteredWhere}
      `),

      db.execute(sql`
        SELECT
          TO_CHAR(c.date_filled, 'YYYY-MM') AS month,
          COUNT(*) FILTER (WHERE c.net_claim_count = 1)::int AS incurred,
          COUNT(*) FILTER (WHERE c.net_claim_count = -1)::int AS reversed
        FROM ${fromForGeneral}
        WHERE ${where}
        GROUP BY TO_CHAR(c.date_filled, 'YYYY-MM')
        ORDER BY month
      `),

      db.execute(sql`
        SELECT
          d.drug_name AS drug_name,
          d.label_name AS label_name,
          c.ndc AS ndc,
          SUM(c.net_claim_count)::int AS net_claims,
          ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS reversal_rate,
          MODE() WITHIN GROUP (ORDER BY c.formulary) AS formulary,
          MODE() WITHIN GROUP (ORDER BY c.pharmacy_state) AS top_state
        FROM claims c
        LEFT JOIN drug_info d ON c.ndc = d.ndc
        WHERE ${where}
        GROUP BY d.drug_name, d.label_name, c.ndc
        ORDER BY SUM(c.net_claim_count) DESC
        LIMIT ${limit}
      `),

      db.execute(sql`
        SELECT
          CASE
            WHEN c.days_supply <= 7 THEN '7'
            WHEN c.days_supply <= 14 THEN '14'
            WHEN c.days_supply <= 30 THEN '30'
            WHEN c.days_supply <= 60 THEN '60'
            WHEN c.days_supply <= 90 THEN '90'
            ELSE 'Other'
          END AS bin,
          SUM(c.net_claim_count)::int AS count
        FROM ${fromForGeneral}
        WHERE ${where}
        GROUP BY 1
        ORDER BY MIN(c.days_supply)
      `),

      db.execute(sql`
        SELECT
          d.mony AS type,
          SUM(c.net_claim_count)::int AS net_claims
        FROM claims c
        LEFT JOIN drug_info d ON c.ndc = d.ndc
        WHERE ${where}
        GROUP BY d.mony
        ORDER BY SUM(c.net_claim_count) DESC
      `),

      db.execute(sql`
        SELECT
          c.group_id AS group_id,
          SUM(c.net_claim_count)::int AS net_claims
        FROM ${fromForGeneral}
        WHERE ${where}
        GROUP BY c.group_id
        ORDER BY SUM(c.net_claim_count) DESC
        LIMIT 10
      `),

      db.execute(sql`
        SELECT
          d.manufacturer_name AS manufacturer_name,
          SUM(c.net_claim_count)::int AS net_claims
        FROM claims c
        LEFT JOIN drug_info d ON c.ndc = d.ndc
        WHERE ${where}
        GROUP BY d.manufacturer_name
        ORDER BY SUM(c.net_claim_count) DESC
        LIMIT 10
      `),
    ]);

    const kpiRow = kpiResult.rows[0] as Record<string, unknown>;
    const kpis: KpiSummary = {
      totalClaims: Number(kpiRow.total_claims) || 0,
      netClaims: Number(kpiRow.net_claims) || 0,
      reversalRate: Number(kpiRow.reversal_rate) || 0,
      uniqueDrugs: Number(kpiRow.unique_drugs) || 0,
    };

    const ufRow = unfilteredKpiResult.rows[0] as Record<string, unknown>;
    const unfilteredKpis: KpiSummary = {
      totalClaims: Number(ufRow.total_claims) || 0,
      netClaims: Number(ufRow.net_claims) || 0,
      reversalRate: Number(ufRow.reversal_rate) || 0,
      uniqueDrugs: Number(ufRow.unique_drugs) || 0,
    };

    const monthly: MonthlyDataPoint[] = (monthlyResult.rows as Record<string, unknown>[]).map(
      (r) => ({
        month: String(r.month),
        incurred: Number(r.incurred) || 0,
        reversed: Number(r.reversed) || 0,
      }),
    );

    const drugs: DrugRow[] = (drugsResult.rows as Record<string, unknown>[]).map((r) => ({
      drugName: (r.drug_name as string) ?? 'Unknown',
      labelName: (r.label_name as string) ?? null,
      ndc: r.ndc as string,
      netClaims: Number(r.net_claims) || 0,
      reversalRate: Number(r.reversal_rate) || 0,
      formulary: (r.formulary as string) ?? 'Unknown',
      topState: (r.top_state as string) ?? 'Unknown',
    }));

    const daysSupply: DaysSupplyBin[] = (daysSupplyResult.rows as Record<string, unknown>[]).map(
      (r) => ({
        bin: r.bin as string,
        count: Number(r.count) || 0,
      }),
    );

    const mony: MonyBreakdown[] = (monyResult.rows as Record<string, unknown>[]).map((r) => ({
      type: (r.type as string) ?? 'Unknown',
      netClaims: Number(r.net_claims) || 0,
    }));

    const topGroups: GroupVolume[] = (topGroupsResult.rows as Record<string, unknown>[]).map(
      (r) => ({
        groupId: r.group_id as string,
        netClaims: Number(r.net_claims) || 0,
      }),
    );

    const topManufacturers: ManufacturerVolume[] = (
      topManufacturersResult.rows as Record<string, unknown>[]
    ).map((r) => ({
      manufacturer: (r.manufacturer_name as string) ?? 'Unknown',
      netClaims: Number(r.net_claims) || 0,
    }));

    const response: ClaimsResponse = {
      kpis,
      unfilteredKpis,
      monthly,
      drugs,
      daysSupply,
      mony,
      topGroups,
      topManufacturers,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('GET /api/claims error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
