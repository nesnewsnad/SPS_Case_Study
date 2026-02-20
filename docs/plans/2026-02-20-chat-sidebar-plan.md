# Chat Sidebar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a floating "Ask the Data" chat sidebar powered by Claude 3.5 Haiku that lets users ask conversational questions about Pharmacy A's claims data.

**Architecture:** Floating action button opens a right-side Sheet overlay. Client uses Vercel AI SDK `useChat` hook to stream messages from a `/api/chat` route that context-stuffs a system prompt with EDA findings + active filter state. No database queries — the model responds from pre-baked analysis.

**Tech Stack:** Vercel AI SDK v6 (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`), shadcn Sheet, Lucide icons, Tailwind CSS.

---

### Task 1: Install @ai-sdk/react

The `ai` v6 package no longer bundles React hooks. We need `@ai-sdk/react` for `useChat`.

**Step 1: Install the package**

Run: `npm install @ai-sdk/react`

**Step 2: Verify installation**

Run: `node -e 'require("@ai-sdk/react"); console.log("ok")'`
Expected: `ok`

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @ai-sdk/react for chat useChat hook"
```

---

### Task 2: Create the system prompt module

Isolate the system prompt in its own file so it's easy to tune without touching the route.

**Files:**

- Create: `src/lib/chat-prompt.ts`

**Step 1: Create the system prompt builder**

```typescript
// src/lib/chat-prompt.ts

interface ChatContext {
  filters?: {
    state?: string;
    formulary?: string;
    mony?: string;
    manufacturer?: string;
    drug?: string;
    groupId?: string;
    dateStart?: string;
    dateEnd?: string;
    includeFlaggedNdcs?: boolean;
  };
  pathname?: string;
}

export function buildSystemPrompt(context?: ChatContext): string {
  return [roleLayer(), edaLayer(), filterLayer(context)].join('\n\n');
}

function roleLayer(): string {
  return `You are an analytics assistant for SPS Health's Pharmacy A claims dashboard. You speak like a PBM analyst colleague — use terms like "reversal rate", "cycle fills", "formulary tier" naturally.

Rules:
- Cite specific numbers from the analysis below. Never invent statistics.
- Keep responses concise: 2-3 short paragraphs max. Use bullet points for lists.
- If asked about something outside the 2021 Pharmacy A claims scope, say so directly.
- When the user has active filters, tailor your response to their filtered view.
- Format numbers with commas (e.g., 531,988 not 531988).`;
}

function edaLayer(): string {
  return `## Pharmacy A — 2021 Claims Analysis

### Headline Numbers
- 596,090 total claim rows: 531,988 incurred (+1), 64,102 reversed (-1). Zero nulls.
- 546,523 "real" rows after excluding the Kryptonite test drug (see Anomaly 1).
- 5,640 unique NDCs in claims → 5,610 match Drug_Info (99.5%). 30 unmatched NDCs (321 rows, 0.05%) — likely OTC/non-drug items.
- 189 GROUP_IDs — every single one is state-specific (no group spans multiple states).
- 5 states: CA, IN, PA, KS, MN. 100% Retail (no mail-order) — expected for LTC pharmacy.
- 365 unique dates — every day of 2021 has claims.

### Anomaly 1: "Kryptonite XR" Test Drug
NDC 65862020190 = "KRYPTONITE XR" / "KINGSLAYER 2.0 1000mg" by "LEX LUTHER INC." (MONY=N). 49,567 claims (8.3% of dataset). 49,301 are in May — May is 99.99% Kryptonite (only 5 real claims). This is a deliberate test/Easter egg planted in the data to see if the analyst catches it. State/formulary distributions mirror the real data perfectly — it's a synthetic injection. Exclude from all real analysis.

### Anomaly 2: Kansas August Batch Reversal
KS August: 6,029 rows, 81.6% reversal rate (4,921 reversed, net = -3,813). Root cause: 18 KS-only groups (all "400xxx" prefix) have 100% reversal / zero incurred in August. Pattern: normal claims in July (~10% reversal) → 100% reversal in August (zero new incurred) → re-incur in September at ~1.4x normal volume. Classic batch reversal + rebill event. KS in every other month has ~9.3-10.4% reversal rate — indistinguishable from other states.

### Anomaly 3: September Spike (+41%)
70,941 real claims vs. ~50,249 avg for normal months. The spike is perfectly uniform: all 5 states up 47-50%, all 3 formularies up 48-50%. Partially explained by KS rebill groups adding ~2,700 extra claims. Remaining ~23,000 excess is unexplained.

### Anomaly 4: November Dip (-54%)
23,337 real claims vs. ~50,249 normal avg. All 30 days present, all 183 active groups present. The dip is perfectly uniform: all states down 54-56%. Not driven by missing groups or days. Possibly a data extract issue or reduced LTC admissions.

### Baseline Rates (remarkably uniform)
- Reversal rate: 10.81% overall. By state: CA 10.0%, IN 10.0%, KS 10.0% (excl. Aug batch), MN 10.0%, PA 10.2%.
- Adjudication rate: 25.1% overall. ~75% not adjudicated at POS — typical for LTC.
- First-of-month cycle fills: Day 1 of every month has 7-8x the volume of an average day. Strong LTC signal.

### Drug Mix
- MONY by claims: Y (generic single-source) 76.8%, N (brand single-source) 20.8%, O (generic multi-source) 1.4%, M (brand multi-source) 1.0%.
- Top drugs: Atorvastatin 40mg (10,154), Tamsulosin 0.4mg (8,617), Pantoprazole 40mg (7,833), Hydrocodone-APAP 5-325mg (7,625), Eliquis 5mg (7,466).
- Top manufacturers: Aurobindo (43K), Ascend (35K), Amneal (34K), Apotex (31K), Zydus (26K) — generic manufacturers dominate.

### Days Supply
- Top values: 14 days (113K, 19%), 7 days (80K, 13%), 30 days (39K, 7%), 1 day (32K, 5%).
- Mean: 13.0 days, Median: 12 days, Max: 120 days.
- 72% of claims are 14 days or shorter — confirms LTC short-cycle dispensing.

### Groups
- 189 total, all state-specific.
- Top by volume: 6P6002 (18,568), 101320 (15,680), 400127 (14,804), 400132 (14,072), 6P6000 (13,833).
- Groups 400127 and 400132 have elevated annual reversal rates (17.3%) — entirely due to August batch event.`;
}

function filterLayer(context?: ChatContext): string {
  if (!context?.filters) return '';

  const parts: string[] = [];
  const f = context.filters;

  if (f.state) parts.push(`State = ${f.state}`);
  if (f.formulary) parts.push(`Formulary = ${f.formulary}`);
  if (f.mony) parts.push(`MONY = ${f.mony}`);
  if (f.manufacturer) parts.push(`Manufacturer = ${f.manufacturer}`);
  if (f.drug) parts.push(`Drug = ${f.drug}`);
  if (f.groupId) parts.push(`Group = ${f.groupId}`);
  if (f.dateStart) parts.push(`From ${f.dateStart}`);
  if (f.dateEnd) parts.push(`To ${f.dateEnd}`);
  parts.push(f.includeFlaggedNdcs ? 'Flagged NDCs included' : 'Flagged NDCs excluded');

  if (parts.length === 1 && !f.includeFlaggedNdcs) {
    return '## Active Filters\nNo filters applied — showing all real claims data (Kryptonite excluded).';
  }

  return `## Active Filters\nThe user is currently viewing: ${parts.join(', ')}. Tailor your responses to this filtered view when relevant.`;
}
```

**Step 2: Commit**

```bash
git add src/lib/chat-prompt.ts
git commit -m "feat: add system prompt builder for chat sidebar"
```

---

### Task 3: Create the API route

**Files:**

- Create: `src/app/api/chat/route.ts`

**Step 1: Create the streaming chat route**

```typescript
// src/app/api/chat/route.ts

import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { buildSystemPrompt } from '@/lib/chat-prompt';

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, data } = body;

  const result = streamText({
    model: anthropic('claude-3-5-haiku-latest'),
    system: buildSystemPrompt(data),
    messages,
    maxTokens: 1024,
  });

  return result.toDataStreamResponse();
}
```

**Step 2: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat: add /api/chat streaming route with Haiku + EDA context"
```

---

### Task 4: Create the ChatSidebar component

This is the main UI component — FAB button, Sheet overlay, messages, input, welcome state.

**Files:**

- Create: `src/components/chat-sidebar.tsx`

**Step 1: Create the full component**

```tsx
// src/components/chat-sidebar.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { usePathname } from 'next/navigation';
import { MessageSquare, Send, X, Sparkles } from 'lucide-react';
import { useFilters } from '@/contexts/filter-context';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SUGGESTIONS: Record<string, string[]> = {
  '/': [
    "What's driving the monthly volume swings?",
    'Why is adjudication so low?',
    'How does our generic rate compare to industry?',
  ],
  '/explorer': [
    'Which drugs have the highest reversal rates?',
    'Why are days supply so short?',
    'What do the top manufacturers tell us?',
  ],
  '/anomalies': [
    'Explain the Kryptonite test drug',
    'What caused the Kansas August event?',
    'Is the September spike real?',
  ],
  '/process': [
    'How did you validate the anomalies?',
    'What would you do differently?',
    'How was the data cleaned?',
  ],
};

function getSuggestions(pathname: string): string[] {
  return SUGGESTIONS[pathname] || SUGGESTIONS['/'];
}

export function ChatSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { filters } = useFilters();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat',
    body: {
      data: {
        filters: {
          state: filters.state,
          formulary: filters.formulary,
          mony: filters.mony,
          manufacturer: filters.manufacturer,
          drug: filters.drug,
          groupId: filters.groupId,
          dateStart: filters.dateStart,
          dateEnd: filters.dateEnd,
          includeFlaggedNdcs: filters.includeFlaggedNdcs,
        },
        pathname,
      },
    },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when sheet opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const handleSuggestionClick = (suggestion: string) => {
    append({ role: 'user', content: suggestion });
  };

  const suggestions = getSuggestions(pathname);
  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Floating Action Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={cn(
            'fixed right-6 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            !hasMessages && 'animate-pulse',
          )}
          aria-label="Open chat"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Chat Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
        >
          {/* Header */}
          <SheetHeader className="border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary h-4 w-4" />
                <SheetTitle className="text-base">Ask the Data</SheetTitle>
                <Badge variant="secondary" className="text-[10px]">
                  Powered by Claude
                </Badge>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground rounded-sm p-1 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </SheetHeader>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {!hasMessages ? (
              /* Welcome State */
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium">
                    Ask me anything about Pharmacy A&apos;s 2021 claims data.
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    I know the anomalies, drug mix, reversal patterns, and seasonal trends.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground text-xs font-medium">Try asking:</p>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      disabled={isLoading}
                      className="text-muted-foreground hover:bg-muted hover:text-foreground block w-full rounded-md border px-3 py-2 text-left text-sm transition-colors disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Message Thread */
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex',
                      message.role === 'user' ? 'justify-end' : 'justify-start',
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                        message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted',
                      )}
                    >
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          {message.content.split('\n').map((line, i) => {
                            if (!line.trim()) return <br key={i} />;
                            // Bold text
                            const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            // Bullet points
                            if (line.trim().startsWith('- ')) {
                              return (
                                <div key={i} className="flex gap-1.5 py-0.5">
                                  <span className="text-muted-foreground mt-0.5 shrink-0">
                                    &bull;
                                  </span>
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: formatted.replace(/^- /, ''),
                                    }}
                                  />
                                </div>
                              );
                            }
                            return (
                              <p
                                key={i}
                                className="py-0.5"
                                dangerouslySetInnerHTML={{
                                  __html: formatted,
                                }}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                      <span className="text-muted-foreground animate-pulse">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t px-4 py-3">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about claims, drugs, anomalies..."
                disabled={isLoading}
                className="bg-muted flex-1 rounded-md px-3 py-2 text-sm outline-none placeholder:text-xs disabled:opacity-50"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !input.trim()}
                className="h-9 w-9 shrink-0 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/chat-sidebar.tsx
git commit -m "feat: add ChatSidebar component with FAB, sheet, suggestions, streaming"
```

---

### Task 5: Wire ChatSidebar into the layout

**Files:**

- Modify: `src/app/layout.tsx`

**Step 1: Add ChatSidebar to the layout**

Add the import at the top of `src/app/layout.tsx`:

```typescript
import { ChatSidebar } from '@/components/chat-sidebar';
```

Then add `<ChatSidebar />` inside the `<FilterProvider>` wrapper, after `<main>`:

Change:

```tsx
<FilterProvider>
  <main className="bg-muted/30 flex-1 overflow-y-auto">{children}</main>
</FilterProvider>
```

To:

```tsx
<FilterProvider>
  <main className="bg-muted/30 flex-1 overflow-y-auto">{children}</main>
  <ChatSidebar />
</FilterProvider>
```

The component must be inside `<FilterProvider>` because it calls `useFilters()`.

**Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: wire ChatSidebar into root layout"
```

---

### Task 6: Set up ANTHROPIC_API_KEY environment variable

**Step 1: Create .env.local for local dev**

Create `.env.local` in the project root:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Verify `.env.local` is in `.gitignore` (it should be by default with Next.js).

**Step 2: Add to Vercel**

Run: `vercel env add ANTHROPIC_API_KEY production preview development`

Or set in Vercel dashboard → Project Settings → Environment Variables.

**Step 3: Verify the key works locally**

Run: `npm run dev`

Open localhost, click the FAB, send a message. Verify streaming response appears.

---

### Task 7: Build verification + deploy

**Step 1: Type-check**

Run: `npm run typecheck`
Expected: No errors.

**Step 2: Build**

Run: `npm run build`
Expected: Clean build, no errors.

**Step 3: Test locally**

Run: `npm run dev`

- Click FAB → Sheet opens
- Welcome card with 3 suggestions visible
- Click a suggestion → message sends, streaming response appears
- Type a follow-up question → conversation continues
- Navigate to different page → suggestions change
- Apply a filter → chat mentions the filter context

**Step 4: Deploy**

Run: `vercel --prod` (or push to main for auto-deploy)

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: Ask the Data chat sidebar — complete"
```
