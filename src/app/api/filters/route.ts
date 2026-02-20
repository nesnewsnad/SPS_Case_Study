import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { parseFilters } from '@/lib/parse-filters';
import { FLAGGED_NDCS } from '@/lib/api-types';
import type { FiltersResponse } from '@/lib/api-types';

export async function GET(request: NextRequest) {
  try {
    const filters = parseFilters(request.nextUrl.searchParams);
    const flaggedNdcs = FLAGGED_NDCS.map((f) => f.ndc);
    const ndcExclusion = !filters.includeFlaggedNdcs && flaggedNdcs.length > 0;

    const claimsFilter = ndcExclusion
      ? sql`entity_id = ${filters.entityId} AND ndc NOT IN (${sql.join(
          flaggedNdcs.map((n) => sql`${n}`),
          sql`, `,
        )})`
      : sql`entity_id = ${filters.entityId}`;

    const drugsResult = await db.execute(sql`
      SELECT DISTINCT d.drug_name
      FROM drug_info d
      WHERE d.ndc IN (SELECT DISTINCT c.ndc FROM claims c WHERE ${claimsFilter})
        AND d.drug_name IS NOT NULL
      ORDER BY d.drug_name
    `);

    const manufacturersResult = await db.execute(sql`
      SELECT DISTINCT d.manufacturer_name
      FROM drug_info d
      WHERE d.ndc IN (SELECT DISTINCT c.ndc FROM claims c WHERE ${claimsFilter})
        AND d.manufacturer_name IS NOT NULL
      ORDER BY d.manufacturer_name
    `);

    const groupsFilter = ndcExclusion
      ? sql`entity_id = ${filters.entityId} AND ndc NOT IN (${sql.join(
          flaggedNdcs.map((n) => sql`${n}`),
          sql`, `,
        )})`
      : sql`entity_id = ${filters.entityId}`;

    const groupsResult = await db.execute(sql`
      SELECT DISTINCT c.group_id
      FROM claims c
      WHERE ${groupsFilter}
        AND c.group_id IS NOT NULL
      ORDER BY c.group_id
    `);

    const response: FiltersResponse = {
      drugs: drugsResult.rows.map((r: Record<string, unknown>) => r.drug_name as string),
      manufacturers: manufacturersResult.rows.map(
        (r: Record<string, unknown>) => r.manufacturer_name as string,
      ),
      groups: groupsResult.rows.map((r: Record<string, unknown>) => r.group_id as string),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('GET /api/filters error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
