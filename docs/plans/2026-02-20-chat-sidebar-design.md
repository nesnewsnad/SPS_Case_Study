# Chat Sidebar Design — "Ask the Data"

**Date**: 2026-02-20
**Status**: APPROVED
**Scope**: Floating chat overlay for conversational access to Pharmacy A claims analysis

## Decisions

| #   | Decision           | Choice                                                                        |
| --- | ------------------ | ----------------------------------------------------------------------------- |
| 1   | UI pattern         | Sheet overlay — FAB in bottom-right, shadcn Sheet from right edge             |
| 2   | Model              | Claude 3.5 Haiku (`claude-3-5-haiku-latest`) — fast, cheap, context-stuffed   |
| 3   | Filter interaction | Filter-aware system prompt — inject active filters per request, no DB queries |
| 4   | Personality        | PBM analyst colleague — domain-fluent, cites numbers, concise                 |
| 5   | Data source        | Static EDA findings in system prompt only — no live DB queries (v1)           |

## Files

```
New:
  src/components/chat-sidebar.tsx    — FAB + Sheet + messages + input
  src/app/api/chat/route.ts          — streaming endpoint

Edit:
  src/app/layout.tsx                 — add <ChatSidebar /> after </main>
```

## UI Architecture

A floating action button (FAB) sits in the bottom-right corner of every page — `MessageSquare` Lucide icon with a subtle pulse animation on first load. Clicking opens a shadcn `Sheet` from the right edge, ~400px wide.

### Sheet Layout

Three zones:

1. **Header**: "Ask the Data" title + close button. Badge: "Powered by Claude".
2. **Message area**: Scrollable list. User messages right-aligned in primary color bubbles, assistant messages left-aligned in muted cards. Assistant messages render markdown (bold, lists, numbers).
3. **Input area**: Text input + send button. Placeholder rotates through suggestions. Sends on Enter, disabled while streaming.

### Welcome State

On first open, a welcome card replaces the empty thread:

> **Ask me anything about Pharmacy A's 2021 claims data.** I know the anomalies, drug mix, reversal patterns, and seasonal trends.

Below it, 3 tappable suggestion chips — context-aware by current page:

| Page               | Suggestions                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Executive Overview | "What's driving the monthly volume swings?" / "Why is adjudication so low?" / "How does our generic rate compare to industry?" |
| Claims Explorer    | "Which drugs have the highest reversal rates?" / "Why are days supply so short?" / "What do the top manufacturers tell us?"    |
| Anomalies          | "Explain the Kryptonite test drug" / "What caused the Kansas August event?" / "Is the September spike real?"                   |
| AI Process         | "How did you validate the anomalies?" / "What would you do differently?" / "How was the data cleaned?"                         |

Clicking a chip populates and auto-sends. Welcome card disappears after first exchange.

## API Route

`POST /api/chat/route.ts` — Vercel AI SDK `streamText` with `@ai-sdk/anthropic`.

### System Prompt Structure

Three layers:

**Layer 1 — Role & guardrails** (~100 words):

- PBM analyst colleague personality
- Cite specific numbers from the analysis
- 2-3 paragraphs max per response
- Stay within 2021 Pharmacy A claims scope
- If asked about something outside scope, say so

**Layer 2 — EDA findings** (~800 words):
Condensed from CLAUDE.md verified findings:

- Headline numbers (596K rows, 531K incurred, 64K reversed, 5,640 NDCs)
- Anomaly 1: Kryptonite XR test drug (49,567 claims, 8.3%, May is fake)
- Anomaly 2: Kansas August batch reversal (18 groups, 100% reversal, rebill in Sep)
- Anomaly 3: September spike (+41%, partially explained by KS rebill)
- Anomaly 4: November dip (-54%, unexplained, uniform across all dimensions)
- Baseline rates (reversal 10.8%, adjudication 25.1%, cycle-fill day-1 pattern)
- Drug mix (76.8% generic single-source, top drugs, top manufacturers)
- Days supply (median 12 days, 72% under 14 days — LTC signal)
- Groups (189 total, all state-specific, top groups by volume)

**Layer 3 — Active filter context** (dynamic, ~50 words):
Injected per request from client. Example: "The user is currently viewing: State=California, Formulary=OPEN, Flagged NDCs excluded. Tailor responses to this filtered view when relevant."

### Request Body

```typescript
{
  messages: Message[],        // from useChat
  data: {
    filters: FilterState,    // from FilterContext
    pathname: string          // for suggested questions context
  }
}
```

### Response

SSE stream via `streamText()` return. Vercel AI SDK handles protocol; `useChat` hook consumes automatically.

## Data Flow

1. User clicks FAB → Sheet opens, welcome card with page-aware suggestions
2. User types or clicks suggestion → `useChat` sends POST to `/api/chat`
3. Client serializes current FilterContext + pathname into request body `data`
4. Route builds 3-layer system prompt (role + EDA + filters)
5. `streamText()` calls Haiku, returns SSE stream
6. `useChat` appends tokens in real-time to assistant message
7. User sees streaming response, can follow up immediately

## State Management

All via Vercel AI SDK `useChat` hook:

- Messages array (in memory, clears on page refresh — fine for demo)
- Loading/streaming state
- Error state
- Abort controller

No external state library. Chat component reads from existing `FilterContext` (already in layout) for filter injection.

## Non-Goals

- **No DB queries** — system prompt provides all context (v2: tool-use for ad-hoc aggregations)
- **No message persistence** — in-memory only, demo context
- **No conversation branching** — single linear thread
- **No file/image responses** — text + markdown only
- **No rate limiting** — demo, not production traffic

## Environment

- `ANTHROPIC_API_KEY` must be set in Vercel env vars (and `.env.local` for dev)
