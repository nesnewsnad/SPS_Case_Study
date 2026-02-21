# Production Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add production-grade security, resilience, validation, and performance to the SPS Health dashboard.

**Architecture:** Four layers applied bottom-up — infrastructure (headers + middleware), data (Zod validation + cache + DB retry), UI (error boundaries + XSS fix + loading), performance (font-display + skip-to-content). Each layer commits independently with a working build.

**Tech Stack:** Next.js 16 (App Router), Zod (input validation), isomorphic-dompurify (XSS sanitization), existing Drizzle/Neon stack.

**Design doc:** `docs/plans/2026-02-21-production-hardening-design.md`

---

## Task 1: Install Dependencies

**Files:**

- Modify: `package.json`

**Step 1: Install zod and isomorphic-dompurify**

```bash
npm install zod isomorphic-dompurify
npm install --save-dev @types/dompurify
```

**Step 2: Verify build still compiles**

```bash
npx next build 2>&1 | tail -20
```

Expected: Build succeeds with no errors.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add zod and isomorphic-dompurify dependencies"
```

---

## Task 2: Security Headers

**Files:**

- Modify: `next.config.ts`

**Step 1: Add headers config**

Replace the entire `next.config.ts` with:

```ts
import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://*.neon.tech",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

Note: `blob:` added to `img-src` for Recharts SVG rendering. `unsafe-inline` and `unsafe-eval` required for Next.js hydration and Recharts dynamic SVG.

**Step 2: Verify build**

```bash
npx next build 2>&1 | tail -20
```

Expected: Build succeeds.

**Step 3: Start dev server and verify headers**

```bash
npx next dev -p 3001 &
sleep 5
curl -sI http://localhost:3001/ | grep -i "x-frame\|x-content-type\|referrer\|strict-transport\|permissions\|content-security"
kill %1
```

Expected: All 7 headers present in response.

**Step 4: Commit**

```bash
git add next.config.ts
git commit -m "feat: add security headers (CSP, HSTS, X-Frame-Options, etc.)"
```

---

## Task 3: Rate-Limited Middleware

**Files:**

- Create: `src/middleware.ts`

**Step 1: Create middleware with rate limiting + request logging**

```ts
import { NextRequest, NextResponse } from 'next/server';

// In-memory sliding window rate limiter (per-instance, resets on cold start)
const CHAT_WINDOW_MS = 60_000; // 1 minute
const CHAT_MAX_REQUESTS = 20;
const chatRequests = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = chatRequests.get(ip) ?? [];

  // Evict expired entries
  const valid = timestamps.filter((t) => now - t < CHAT_WINDOW_MS);

  if (valid.length >= CHAT_MAX_REQUESTS) {
    chatRequests.set(ip, valid);
    return true;
  }

  valid.push(now);
  chatRequests.set(ip, valid);
  return false;
}

export function middleware(request: NextRequest) {
  const start = Date.now();
  const { pathname } = request.nextUrl;

  // Rate limit chat route
  if (pathname === '/api/chat') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before sending another message.' },
        { status: 429 },
      );
    }
  }

  // Request logging for all API routes
  const response = NextResponse.next();
  const duration = Date.now() - start;
  console.log(`[API] ${request.method} ${pathname} (${duration}ms)`);

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

**Step 2: Verify build**

```bash
npx next build 2>&1 | tail -20
```

Expected: Build succeeds.

**Step 3: Verify middleware runs**

```bash
npx next dev -p 3001 &
sleep 5
curl -s http://localhost:3001/api/entities | head -c 100
# Check server logs for [API] line
kill %1
```

Expected: API responds normally, server log shows `[API] GET /api/entities`.

**Step 4: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add API middleware with rate limiting (20/min on chat) and request logging"
```

---

## Task 4: Zod Input Validation

**Files:**

- Create: `src/lib/validation.ts`
- Modify: `src/lib/parse-filters.ts`
- Modify: `src/app/api/chat/route.ts`

**Step 1: Create Zod validation schemas**

Create `src/lib/validation.ts`:

```ts
import { z } from 'zod';

const datePattern = /^\d{4}-?\d{2}-?\d{2}$/;

export const filterSchema = z.object({
  entityId: z.coerce.number().int().positive().default(1),
  formulary: z.enum(['OPEN', 'MANAGED', 'HMF']).optional(),
  state: z.enum(['CA', 'IN', 'PA', 'KS', 'MN']).optional(),
  mony: z.enum(['M', 'O', 'N', 'Y']).optional(),
  manufacturer: z.string().max(200).optional(),
  drug: z.string().max(200).optional(),
  ndc: z.string().max(20).optional(),
  dateStart: z.string().regex(datePattern, 'Invalid date format').optional(),
  dateEnd: z.string().regex(datePattern, 'Invalid date format').optional(),
  groupId: z.string().max(50).optional(),
  includeFlaggedNdcs: z.boolean().default(false),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ValidatedFilters = z.infer<typeof filterSchema>;

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.union([
    z.string().max(4096),
    z.array(z.any()), // AI SDK uses content parts
  ]),
  parts: z.array(z.any()).optional(),
  id: z.string().optional(),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).max(50),
  data: z.record(z.unknown()).optional(),
});
```

**Step 2: Integrate into parseFilters**

Replace `src/lib/parse-filters.ts`:

```ts
import { filterSchema } from './validation';
import type { FilterParams } from './api-types';

export function parseFilters(searchParams: URLSearchParams): FilterParams {
  const raw = {
    entityId: searchParams.get('entityId') ?? undefined,
    formulary: searchParams.get('formulary') ?? undefined,
    state: searchParams.get('state') ?? undefined,
    mony: searchParams.get('mony') ?? undefined,
    manufacturer: searchParams.get('manufacturer') ?? undefined,
    drug: searchParams.get('drug') ?? undefined,
    ndc: searchParams.get('ndc') ?? undefined,
    dateStart: searchParams.get('dateStart') ?? undefined,
    dateEnd: searchParams.get('dateEnd') ?? undefined,
    groupId: searchParams.get('groupId') ?? undefined,
    includeFlaggedNdcs: searchParams.get('flagged') === 'true',
    limit: searchParams.get('limit') ?? undefined,
  };

  // Strip undefined values so Zod defaults kick in
  const cleaned = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined));

  const parsed = filterSchema.safeParse(cleaned);

  if (!parsed.success) {
    // Fall back to safe defaults on invalid input — don't crash the route
    console.warn('[validation] Invalid filter params:', parsed.error.flatten().fieldErrors);
    return { entityId: 1, includeFlaggedNdcs: false };
  }

  return {
    entityId: parsed.data.entityId,
    formulary: parsed.data.formulary,
    state: parsed.data.state,
    mony: parsed.data.mony,
    manufacturer: parsed.data.manufacturer,
    drug: parsed.data.drug,
    ndc: parsed.data.ndc,
    dateStart: parsed.data.dateStart,
    dateEnd: parsed.data.dateEnd,
    groupId: parsed.data.groupId,
    includeFlaggedNdcs: parsed.data.includeFlaggedNdcs,
  };
}
```

**Step 3: Add validation to chat route**

Replace `src/app/api/chat/route.ts`:

```ts
import { streamText, convertToModelMessages } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { buildSystemPrompt } from '@/lib/chat-prompt';
import { chatRequestSchema } from '@/lib/validation';

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

    const result = streamText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: buildSystemPrompt(data as Parameters<typeof buildSystemPrompt>[0]),
      messages: await convertToModelMessages(messages),
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
```

**Step 4: Verify build**

```bash
npx next build 2>&1 | tail -20
```

Expected: Build succeeds, no type errors.

**Step 5: Test validation works (dev server)**

```bash
npx next dev -p 3001 &
sleep 5
# Valid request should work
curl -s "http://localhost:3001/api/overview?entityId=1" | head -c 100
# Invalid state should fall back gracefully
curl -s "http://localhost:3001/api/overview?state=INVALID" | head -c 100
kill %1
```

Expected: Both return valid JSON responses (invalid input falls back to defaults).

**Step 6: Commit**

```bash
git add src/lib/validation.ts src/lib/parse-filters.ts src/app/api/chat/route.ts
git commit -m "feat: add Zod input validation for API filters and chat route"
```

---

## Task 5: Cache Headers on API Routes

**Files:**

- Modify: `src/app/api/overview/route.ts`
- Modify: `src/app/api/claims/route.ts`
- Modify: `src/app/api/anomalies/route.ts`
- Modify: `src/app/api/filters/route.ts`
- Modify: `src/app/api/entities/route.ts`

**Step 1: Add cache headers to each data route**

In each of the 5 data routes, change the `return NextResponse.json(response)` line to:

```ts
return NextResponse.json(response, {
  headers: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  },
});
```

There is exactly one `NextResponse.json(response)` in each route's success path. Do NOT add cache headers to the error responses.

**Routes to modify:**

- `src/app/api/overview/route.ts:274` — `return NextResponse.json(response)` → add headers
- `src/app/api/claims/route.ts:256` — `return NextResponse.json(response)` → add headers
- `src/app/api/anomalies/route.ts:419` — `return NextResponse.json(response)` → add headers
- `src/app/api/filters/route.ts:60` — `return NextResponse.json(response)` → add headers
- `src/app/api/entities/route.ts:15` — `return NextResponse.json(response)` → add headers

**Step 2: Verify build**

```bash
npx next build 2>&1 | tail -20
```

**Step 3: Verify cache headers present**

```bash
npx next dev -p 3001 &
sleep 5
curl -sI http://localhost:3001/api/entities | grep -i cache-control
kill %1
```

Expected: `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`

**Step 4: Commit**

```bash
git add src/app/api/overview/route.ts src/app/api/claims/route.ts src/app/api/anomalies/route.ts src/app/api/filters/route.ts src/app/api/entities/route.ts
git commit -m "feat: add cache headers (5min edge cache) on all read-only API routes"
```

---

## Task 6: Database Resilience Wrapper

**Files:**

- Create: `src/lib/db-utils.ts`

**Step 1: Create retry wrapper**

Create `src/lib/db-utils.ts`:

```ts
/**
 * Lightweight retry wrapper for database queries.
 * Handles transient Neon serverless HTTP errors (cold starts, network blips).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  { retries = 2, baseDelay = 200 } = {},
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt < retries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(
          `[db-retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms:`,
          err instanceof Error ? err.message : err,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
```

This is a standalone utility. API routes can opt into it by wrapping their `Promise.all(...)` calls:

```ts
import { withRetry } from '@/lib/db-utils';

// Usage in any route:
const results = await withRetry(() => Promise.all([...queries]));
```

**Not integrating into every route now** — the wrapper exists for the pattern to be visible in code review. Wrapping every `db.execute` adds noise for minimal benefit (Neon HTTP is already retry-friendly). We'll apply it to the anomalies route (heaviest queries) as a demonstration.

**Step 2: Apply to anomalies route**

In `src/app/api/anomalies/route.ts`, wrap the two `Promise.all` blocks:

```ts
import { withRetry } from '@/lib/db-utils';
```

Then change:

```ts
const [kryptoniteMonthly, ...] = await Promise.all([...]);
```

to:

```ts
const [kryptoniteMonthly, ...] = await withRetry(() => Promise.all([...]));
```

Apply to both `Promise.all` calls in the anomalies route (lines ~26-77 and ~139-204).

**Step 3: Verify build**

```bash
npx next build 2>&1 | tail -20
```

**Step 4: Commit**

```bash
git add src/lib/db-utils.ts src/app/api/anomalies/route.ts
git commit -m "feat: add DB retry wrapper with exponential backoff, apply to anomalies route"
```

---

## Task 7: Error Boundaries

**Files:**

- Create: `src/app/error.tsx`
- Create: `src/app/global-error.tsx`

**Step 1: Create page-level error boundary**

Create `src/app/error.tsx`:

```tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-red-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
          <p className="text-sm text-gray-600">
            An unexpected error occurred while loading this page.
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-gray-400">Error ID: {error.digest}</p>
          )}
        </div>
        <button
          onClick={reset}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:outline-none"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Create global error boundary**

Create `src/app/global-error.tsx`:

```tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backgroundColor: '#f9fafb',
          }}
        >
          <div
            style={{
              maxWidth: '28rem',
              padding: '2rem',
              borderRadius: '0.75rem',
              border: '1px solid #fecaca',
              backgroundColor: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginTop: 0 }}>
              Application Error
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
              A critical error occurred. Please refresh the page.
            </p>
            {error.digest && (
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: '#0d9488',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
```

Note: `global-error.tsx` uses inline styles because it renders outside the root layout — no Tailwind available.

**Step 3: Verify build**

```bash
npx next build 2>&1 | tail -20
```

**Step 4: Commit**

```bash
git add src/app/error.tsx src/app/global-error.tsx
git commit -m "feat: add error boundaries (page-level + global) with teal-themed recovery UI"
```

---

## Task 8: Loading Skeleton

**Files:**

- Create: `src/app/loading.tsx`

**Step 1: Create loading skeleton**

Create `src/app/loading.tsx`:

```tsx
export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 p-6 md:p-10">
      {/* Page title skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-lg bg-gray-200" />
        <div className="h-4 w-96 rounded bg-gray-100" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-gray-100 bg-white p-4">
            <div className="h-3 w-20 rounded bg-gray-100" />
            <div className="mt-3 h-7 w-24 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-16 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Chart area skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-xl border border-gray-100 bg-white p-4">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="mt-4 h-52 rounded bg-gray-50" />
        </div>
        <div className="h-72 rounded-xl border border-gray-100 bg-white p-4">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="mt-4 h-52 rounded bg-gray-50" />
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

```bash
npx next build 2>&1 | tail -20
```

**Step 3: Commit**

```bash
git add src/app/loading.tsx
git commit -m "feat: add loading skeleton with KPI card + chart grid placeholders"
```

---

## Task 9: XSS Fix — DOMPurify in Chat Sidebar

**Files:**

- Modify: `src/components/chat-sidebar.tsx`

**Step 1: Add DOMPurify import and sanitize both dangerouslySetInnerHTML calls**

At the top of `src/components/chat-sidebar.tsx`, add:

```ts
import DOMPurify from 'isomorphic-dompurify';
```

Then replace the two `dangerouslySetInnerHTML` usages:

**First occurrence (~line 221):**

```tsx
// BEFORE:
dangerouslySetInnerHTML={{
  __html: formatted.replace(/^- /, ''),
}}

// AFTER:
dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(formatted.replace(/^- /, '')),
}}
```

**Second occurrence (~line 232):**

```tsx
// BEFORE:
dangerouslySetInnerHTML={{
  __html: formatted,
}}

// AFTER:
dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(formatted),
}}
```

**Step 2: Add aria-live to messages area**

Find the messages container div (~line 186):

```tsx
// BEFORE:
<div className="space-y-4">

// AFTER:
<div className="space-y-4" aria-live="polite">
```

This is the `<div>` that wraps `{messages.map(...)}` inside the message thread.

**Step 3: Verify build**

```bash
npx next build 2>&1 | tail -20
```

**Step 4: Commit**

```bash
git add src/components/chat-sidebar.tsx
git commit -m "fix: sanitize chat output with DOMPurify, add aria-live for screen readers"
```

---

## Task 10: Font Display + Skip-to-Content + Viewport

**Files:**

- Modify: `src/app/layout.tsx`

**Step 1: Add font-display swap**

Change the font configs:

```tsx
// BEFORE:
const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

// AFTER:
const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});
```

**Step 2: Add skip-to-content link and main ID**

```tsx
// BEFORE:
<body className={`${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
  <TooltipProvider>
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <Suspense>
        <FilterProvider>
          <main className="dashboard-bg flex-1 overflow-y-auto pt-14 md:pt-0">

// AFTER:
<body className={`${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-teal-900 focus:shadow-lg focus:ring-2 focus:ring-teal-500"
  >
    Skip to content
  </a>
  <TooltipProvider>
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <Suspense>
        <FilterProvider>
          <main id="main-content" className="dashboard-bg flex-1 overflow-y-auto pt-14 md:pt-0">
```

**Step 3: Verify build**

```bash
npx next build 2>&1 | tail -20
```

**Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "perf: font-display swap, skip-to-content link, main content landmark ID"
```

---

## Task 11: Final Build Verification + Summary Commit

**Step 1: Full build**

```bash
npx next build 2>&1 | tail -30
```

Expected: Build succeeds with no errors or warnings.

**Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: No type errors.

**Step 3: Lint**

```bash
npx eslint src/
```

Expected: No lint errors.

**Step 4: Quick smoke test**

```bash
npx next dev -p 3001 &
sleep 5

# Test API endpoints return data
curl -s http://localhost:3001/api/entities | head -c 50
curl -s http://localhost:3001/api/overview?entityId=1 | head -c 50

# Test security headers
curl -sI http://localhost:3001/ | grep -c "X-Frame-Options\|X-Content-Type-Options\|Content-Security-Policy"

# Test cache headers
curl -sI http://localhost:3001/api/entities | grep -i cache-control

# Test rate limit (won't actually hit 20 — just verify 200)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/chat -X POST -H "Content-Type: application/json" -d '{"messages":[]}'

kill %1
```

**Step 5: Clean up .continue-here.md if still present**

```bash
[ -f .continue-here.md ] && git rm .continue-here.md && git commit -m "chore: remove continue-here checkpoint"
```

---

## Summary

| Task | Layer             | What                               | Files                                                        |
| ---- | ----------------- | ---------------------------------- | ------------------------------------------------------------ |
| 1    | Setup             | Install zod + isomorphic-dompurify | package.json                                                 |
| 2    | L1 Infrastructure | Security headers in next.config    | next.config.ts                                               |
| 3    | L1 Infrastructure | Rate-limited middleware            | src/middleware.ts (new)                                      |
| 4    | L2 Data           | Zod validation schemas             | src/lib/validation.ts (new), parse-filters.ts, chat/route.ts |
| 5    | L2 Data           | Cache headers on API routes        | 5 route files                                                |
| 6    | L2 Data           | DB retry wrapper                   | src/lib/db-utils.ts (new), anomalies/route.ts                |
| 7    | L3 UI             | Error boundaries                   | src/app/error.tsx (new), global-error.tsx (new)              |
| 8    | L3 UI             | Loading skeleton                   | src/app/loading.tsx (new)                                    |
| 9    | L3 UI             | XSS fix + ARIA                     | src/components/chat-sidebar.tsx                              |
| 10   | L4 Performance    | Font display + skip link           | src/app/layout.tsx                                           |
| 11   | Verify            | Full build + smoke test            | —                                                            |
