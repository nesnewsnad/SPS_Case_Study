import { streamText, convertToModelMessages, tool, stepCountIs } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
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

// ── Shared query helpers ─────────────────────────────────────────────

interface ToolFilters {
  state?: string;
  formulary?: string;
  mony?: string;
  drug?: string;
  manufacturer?: string;
  groupId?: string;
  dateStart?: string;
  dateEnd?: string;
}

/** Build WHERE clause + detect if drug_info JOIN is needed. Always excludes Kryptonite. */
function buildWhere(f: ToolFilters = {}): { where: SQL; needsJoin: boolean } {
  const parts: SQL[] = [sql`c.entity_id = 1`];
  let needsJoin = false;

  // Always exclude Kryptonite test drug
  if (FLAGGED_NDCS.length > 0) {
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

  return { where: sql.join(parts, sql` AND `), needsJoin };
}

function fromClause(needsJoin: boolean): SQL {
  return needsJoin ? sql`FROM claims c LEFT JOIN drug_info d ON c.ndc = d.ndc` : sql`FROM claims c`;
}

const FROM_WITH_DRUG = sql`FROM claims c LEFT JOIN drug_info d ON c.ndc = d.ndc`;

// ── Filter-aware pre-fetch (for system prompt injection) ─────────────

interface ChatFilters extends ToolFilters {
  includeFlaggedNdcs?: boolean;
}

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

async function fetchFilteredData(f: ChatFilters): Promise<FilteredData | undefined> {
  try {
    const { where, needsJoin } = buildWhere(f);
    const from = fromClause(needsJoin);

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
        ${FROM_WITH_DRUG}
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

// ── Tool definitions ─────────────────────────────────────────────────

const filterParams = {
  state: z.enum(['CA', 'IN', 'PA', 'KS', 'MN']).optional().describe('State filter'),
  formulary: z.enum(['OPEN', 'MANAGED', 'HMF']).optional().describe('Formulary type'),
  mony: z
    .enum(['M', 'O', 'N', 'Y'])
    .optional()
    .describe(
      'MONY drug classification: M=brand multi, O=generic multi, N=brand single, Y=generic single',
    ),
  drug: z.string().optional().describe('Exact drug name (e.g. "Atorvastatin Calcium")'),
  manufacturer: z.string().optional().describe('Manufacturer name'),
  groupId: z.string().optional().describe('Group ID (e.g. "6P6002")'),
  dateStart: z.string().optional().describe('Start date YYYY-MM-DD'),
  dateEnd: z.string().optional().describe('End date YYYY-MM-DD'),
};

const queryKpis = tool({
  description:
    'Get KPI summary (total claims, net claims, reversal rate, unique drugs) for any filter combination. Use when the user asks about claim counts, reversal rates, or volume for a specific slice.',
  inputSchema: z.object(filterParams),
  execute: async (params) => {
    const { where, needsJoin } = buildWhere(params);
    const from = fromClause(needsJoin);
    const result = await db.execute(sql`
      SELECT
        COUNT(*)::int AS total_claims,
        COALESCE(SUM(c.net_claim_count), 0)::int AS net_claims,
        ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS reversal_rate,
        COUNT(DISTINCT c.ndc)::int AS unique_drugs
      ${from}
      WHERE ${where}
    `);
    const row = result.rows[0] as Record<string, unknown>;
    return {
      totalClaims: Number(row.total_claims) || 0,
      netClaims: Number(row.net_claims) || 0,
      reversalRate: Number(row.reversal_rate) || 0,
      uniqueDrugs: Number(row.unique_drugs) || 0,
    };
  },
});

const queryTopDrugs = tool({
  description:
    'Get top drugs ranked by net claims, with reversal rates. Use when the user asks about popular drugs, drug mix, or drug-level comparisons for a given filter.',
  inputSchema: z.object({
    ...filterParams,
    limit: z
      .number()
      .int()
      .min(1)
      .max(25)
      .optional()
      .default(10)
      .describe('Number of drugs to return (default 10)'),
  }),
  execute: async ({ limit, ...params }) => {
    const { where } = buildWhere(params);
    const result = await db.execute(sql`
      SELECT
        d.drug_name AS name,
        SUM(c.net_claim_count)::int AS net_claims,
        COUNT(*)::int AS total_claims,
        ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS reversal_rate
      ${FROM_WITH_DRUG}
      WHERE ${where}
        AND d.drug_name IS NOT NULL
      GROUP BY d.drug_name
      ORDER BY net_claims DESC
      LIMIT ${limit}
    `);
    return (result.rows as Array<Record<string, unknown>>).map((r) => ({
      name: String(r.name),
      netClaims: Number(r.net_claims) || 0,
      totalClaims: Number(r.total_claims) || 0,
      reversalRate: Number(r.reversal_rate) || 0,
    }));
  },
});

const queryMonthlyTrend = tool({
  description:
    'Get monthly incurred/reversed/net claim breakdown. Use when the user asks about trends over time, seasonal patterns, specific months, or volume comparisons between months.',
  inputSchema: z.object(filterParams),
  execute: async (params) => {
    const { where, needsJoin } = buildWhere(params);
    const from = fromClause(needsJoin);
    const result = await db.execute(sql`
      SELECT
        TO_CHAR(c.date_filled, 'YYYY-MM') AS month,
        COUNT(*) FILTER (WHERE c.net_claim_count = 1)::int AS incurred,
        COUNT(*) FILTER (WHERE c.net_claim_count = -1)::int AS reversed,
        COALESCE(SUM(c.net_claim_count), 0)::int AS net
      ${from}
      WHERE ${where}
      GROUP BY TO_CHAR(c.date_filled, 'YYYY-MM')
      ORDER BY month
    `);
    return (result.rows as Array<Record<string, unknown>>).map((r) => ({
      month: String(r.month),
      incurred: Number(r.incurred) || 0,
      reversed: Number(r.reversed) || 0,
      net: Number(r.net) || 0,
    }));
  },
});

// ── POST handler ─────────────────────────────────────────────────────

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

    // Pre-load filtered context into system prompt when filters are active
    const filteredData = hasMeaningfulFilters(filters)
      ? await fetchFilteredData(filters)
      : undefined;

    const context = {
      ...(data as Parameters<typeof buildSystemPrompt>[0]),
      filteredData,
    };

    const result = streamText({
      model: anthropic('claude-sonnet-4-5'),
      system: buildSystemPrompt(context),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: await convertToModelMessages(ensureParts(messages) as any),
      maxOutputTokens: 1024,
      tools: { queryKpis, queryTopDrugs, queryMonthlyTrend },
      stopWhen: stepCountIs(3),
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
