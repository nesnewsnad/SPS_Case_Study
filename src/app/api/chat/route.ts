import { streamText, convertToModelMessages } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { sql, SQL } from 'drizzle-orm';
import { db } from '@/db';
import { buildSystemPrompt, FilteredData } from '@/lib/chat-prompt';
import { chatRequestSchema } from '@/lib/validation';
import { FLAGGED_NDCS } from '@/lib/api-types';

/** Ensure every message has `parts` — convertToModelMessages requires it. */
function ensureParts(
  messages: Array<{ role: string; content?: unknown; parts?: unknown[]; id?: string }>,
) {
  return messages.map((m) => {
    if (m.parts && Array.isArray(m.parts) && m.parts.length > 0) return m;
    const text = typeof m.content === 'string' ? m.content : '';
    return { ...m, parts: [{ type: 'text' as const, text }] };
  });
}

interface ChatFilters {
  state?: string;
  formulary?: string;
  mony?: string;
  manufacturer?: string;
  drug?: string;
  groupId?: string;
  dateStart?: string;
  dateEnd?: string;
  includeFlaggedNdcs?: boolean;
}

/** True if any meaningful filter is active (not just the default Kryptonite exclusion). */
function hasMeaningfulFilters(f?: ChatFilters): f is ChatFilters {
  if (!f) return false;
  return !!(
    f.state ||
    f.formulary ||
    f.mony ||
    f.manufacturer ||
    f.drug ||
    f.groupId ||
    f.dateStart ||
    f.dateEnd
  );
}

/** Run lightweight KPI + top-drugs queries for the active filter set. */
async function fetchFilteredData(f: ChatFilters): Promise<FilteredData | undefined> {
  try {
    const parts: SQL[] = [sql`c.entity_id = 1`];
    let needsJoin = false;

    if (!f.includeFlaggedNdcs && FLAGGED_NDCS.length > 0) {
      parts.push(
        sql`c.ndc NOT IN (${sql.join(
          FLAGGED_NDCS.map((x) => sql`${x.ndc}`),
          sql`, `,
        )})`,
      );
    }
    if (f.state) parts.push(sql`c.pharmacy_state = ${f.state}`);
    if (f.formulary) parts.push(sql`c.formulary = ${f.formulary}`);
    if (f.groupId) parts.push(sql`c.group_id = ${f.groupId}`);
    if (f.dateStart) parts.push(sql`c.date_filled >= ${f.dateStart}`);
    if (f.dateEnd) parts.push(sql`c.date_filled <= ${f.dateEnd}`);
    if (f.mony) {
      needsJoin = true;
      parts.push(sql`d.mony = ${f.mony}`);
    }
    if (f.manufacturer) {
      needsJoin = true;
      parts.push(sql`d.manufacturer_name = ${f.manufacturer}`);
    }
    if (f.drug) {
      needsJoin = true;
      parts.push(sql`d.drug_name = ${f.drug}`);
    }

    const where = sql.join(parts, sql` AND `);
    const from = needsJoin
      ? sql`FROM claims c LEFT JOIN drug_info d ON c.ndc = d.ndc`
      : sql`FROM claims c`;
    // Always join drug_info for top-drugs query
    const fromWithDrug = sql`FROM claims c LEFT JOIN drug_info d ON c.ndc = d.ndc`;

    const [kpiResult, drugsResult] = await Promise.all([
      db.execute(sql`
        SELECT
          COUNT(*)::int AS total_claims,
          COALESCE(SUM(c.net_claim_count), 0)::int AS net_claims,
          ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS reversal_rate,
          COUNT(DISTINCT c.ndc)::int AS unique_drugs
        ${from}
        WHERE ${where}
      `),
      db.execute(sql`
        SELECT d.drug_name AS name, SUM(c.net_claim_count)::int AS net_claims
        ${fromWithDrug}
        WHERE ${where}
          AND d.drug_name IS NOT NULL
        GROUP BY d.drug_name
        ORDER BY net_claims DESC
        LIMIT 5
      `),
    ]);

    const kpi = kpiResult.rows[0] as Record<string, unknown>;
    const topDrugs = (drugsResult.rows as Array<{ name: string; net_claims: number }>).map((r) => ({
      name: r.name,
      netClaims: Number(r.net_claims) || 0,
    }));

    return {
      totalClaims: Number(kpi.total_claims) || 0,
      netClaims: Number(kpi.net_claims) || 0,
      reversalRate: Number(kpi.reversal_rate) || 0,
      uniqueDrugs: Number(kpi.unique_drugs) || 0,
      topDrugs,
    };
  } catch (err) {
    console.error('fetchFilteredData error (falling back to static EDA):', err);
    return undefined;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          details: parsed.error.flatten().fieldErrors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const { messages, data } = parsed.data;
    const filters = data?.filters as ChatFilters | undefined;

    // Only hit the DB when the user has meaningful filters active
    const filteredData = hasMeaningfulFilters(filters)
      ? await fetchFilteredData(filters)
      : undefined;

    const context = {
      ...(data as Parameters<typeof buildSystemPrompt>[0]),
      filteredData,
    };

    const result = streamText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: buildSystemPrompt(context),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: await convertToModelMessages(ensureParts(messages) as any),
      maxOutputTokens: 1024,
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error('POST /api/chat error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
