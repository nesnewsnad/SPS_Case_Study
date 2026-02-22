# Plan: Agentic Chat — Add Tool Use to Chat Endpoint

## Context

The "Ask the Data" chat sidebar currently works as a static FAQ bot: user asks a question, Haiku answers from a pre-built system prompt containing EDA findings. When filters are active, `fetchFilteredData()` runs 2 lightweight queries (KPIs + top 5 drugs) and injects results into the prompt — but the model can't ask for data itself.

Making the chat agentic means giving the model tools it can call to query the database on demand. Instead of reciting memorized stats, it can look up live numbers in response to any question. The infrastructure is ready: Vercel AI SDK v6 supports `tools` in `streamText()`, and the query patterns already exist in the API routes.

## Approach

Add 3 tools to the `streamText()` call in `src/app/api/chat/route.ts`. Each tool runs SQL directly via `db.execute()` (same pattern as `fetchFilteredData()` already in the file). No new files — everything goes in the existing chat route + a system prompt update.

### Tools

#### 1. `queryKpis` — Get KPI summary for any filter combination
- **Parameters**: `state?`, `formulary?`, `mony?`, `drug?`, `manufacturer?`, `groupId?`, `dateStart?`, `dateEnd?`
- **Returns**: `{ totalClaims, netClaims, reversalRate, uniqueDrugs }`
- **Query**: Reuse the KPI query pattern from `fetchFilteredData()` (already in the file, lines 86-95)

#### 2. `queryTopDrugs` — Get top drugs by volume with reversal rates
- **Parameters**: Same filter set + `limit?` (default 10)
- **Returns**: `Array<{ name, netClaims, reversalRate }>`
- **Query**: Expand the existing top-drugs query (lines 96-104) to include reversal rate

#### 3. `queryMonthlyTrend` — Get monthly incurred/reversed breakdown
- **Parameters**: Same filter set
- **Returns**: `Array<{ month, incurred, reversed, net }>`
- **Query**: Same monthly pattern used in `/api/overview` and `/api/claims`

### Why these 3 tools?

These cover the questions users actually ask:
- "What's the reversal rate in Kansas?" → `queryKpis({ state: 'KS' })`
- "Top drugs in California?" → `queryTopDrugs({ state: 'CA' })`
- "What happened in September?" → `queryMonthlyTrend()` then model reads the spike

Three tools is the sweet spot — enough to answer real questions, few enough that Haiku picks the right one reliably.

## Files Changed

| File | Change | Risk |
|------|--------|------|
| `src/app/api/chat/route.ts` | Add `tools` parameter with 3 tool definitions to `streamText()` call. Add shared `buildWhere()` helper (extracted from existing `fetchFilteredData` pattern). | Low — additive change to existing endpoint |
| `src/lib/chat-prompt.ts` | Add 1 paragraph to system prompt telling the model it has tools and when to use them vs. answering from memory. | Low — prompt text only |

## Implementation Details

### Tool definitions (in chat route)

```ts
import { tool } from 'ai';
import { z } from 'zod';

// Shared filter schema for all tools
const toolFilterSchema = z.object({
  state: z.enum(['CA', 'IN', 'PA', 'KS', 'MN']).optional().describe('State filter'),
  formulary: z.enum(['OPEN', 'MANAGED', 'HMF']).optional().describe('Formulary type'),
  mony: z.enum(['M', 'O', 'N', 'Y']).optional().describe('MONY drug classification'),
  drug: z.string().optional().describe('Drug name filter'),
  manufacturer: z.string().optional().describe('Manufacturer name'),
  groupId: z.string().optional().describe('Group ID'),
  dateStart: z.string().optional().describe('Start date YYYY-MM-DD'),
  dateEnd: z.string().optional().describe('End date YYYY-MM-DD'),
});
```

Each tool's `execute` function:
1. Builds a WHERE clause from params (extract the pattern from existing `fetchFilteredData`)
2. Runs `db.execute(sql`...`)`
3. Returns typed JSON — the SDK feeds this back to the model automatically

### streamText change

```ts
const result = streamText({
  model: anthropic('claude-haiku-4-5-20251001'),
  system: buildSystemPrompt(context),
  messages: await convertToModelMessages(ensureParts(messages) as any),
  maxOutputTokens: 1024,
  tools: { queryKpis, queryTopDrugs, queryMonthlyTrend },
  maxSteps: 3, // allow up to 3 tool calls per message
});
```

`maxSteps: 3` lets the model chain tool calls (e.g., query KPIs then query drugs) but caps it to avoid runaway loops.

### System prompt addition (in chat-prompt.ts)

Add to the role layer:

```
You have tools to query the database directly. Use them when the user asks about
specific numbers, filtered data, or comparisons that aren't covered by the EDA
findings below. For general questions about the data story, anomalies, or
methodology, answer from your knowledge — don't query unnecessarily.
```

### What happens to `fetchFilteredData()`?

Keep it. It pre-loads filtered context into the system prompt so the model has immediate awareness of active filters without needing a tool call. The tools are for follow-up questions where the user asks for something the prompt doesn't cover.

## Verification

1. `npx vitest run` — all 112 existing tests still pass (no test files changed)
2. Manual test in the chat sidebar:
   - "What's the reversal rate in Kansas?" → should call `queryKpis`, return live number
   - "Top 5 drugs in California?" → should call `queryTopDrugs`, return ranked list
   - "What's the Kryptonite anomaly?" → should answer from prompt (no tool call)
   - "Compare September and October volumes" → should call `queryMonthlyTrend`
3. Verify Vercel preview deploy works (tools run server-side, no client changes needed)
