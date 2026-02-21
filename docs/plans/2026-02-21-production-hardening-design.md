# Production Hardening Design

**Date**: 2026-02-21
**Goal**: Comprehensive production hardening — both code review optics and live demo protection
**Approach**: Layer-by-layer, bottom-up through the stack
**New dependencies**: `zod`, `isomorphic-dompurify`

---

## Layer 1: Infrastructure — Security Headers + Middleware

### Security Headers (`next.config.ts`)

Add `headers()` config returning these on all routes:

| Header                    | Value                                                                                                                                                                                                           | Purpose                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| X-Frame-Options           | DENY                                                                                                                                                                                                            | Prevent iframe embedding |
| X-Content-Type-Options    | nosniff                                                                                                                                                                                                         | Prevent MIME sniffing    |
| Referrer-Policy           | strict-origin-when-cross-origin                                                                                                                                                                                 | Limit referrer leakage   |
| X-DNS-Prefetch-Control    | on                                                                                                                                                                                                              | Speed up external DNS    |
| Strict-Transport-Security | max-age=63072000; includeSubDomains                                                                                                                                                                             | HSTS                     |
| Permissions-Policy        | camera=(), microphone=(), geolocation=()                                                                                                                                                                        | Deny device APIs         |
| Content-Security-Policy   | default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://\*.neon.tech | XSS mitigation           |

**Risk**: CSP must not break Recharts SVG rendering or shadcn portals. Test during implementation.

### Middleware (`src/middleware.ts`)

- **Rate limiting on `/api/chat`**: In-memory sliding window, 20 requests/min per IP. Returns 429 with JSON error when exceeded. Simple `Map<string, number[]>` — no external dependency, not distributed (resets on cold start).
- **Request logging**: `console.log` with timestamp, method, path, status, duration for all `/api/*` routes. Visible in Vercel function logs.
- **Matcher**: `/api/:path*` only — no middleware on static assets or pages.

---

## Layer 2: Data Layer — Validation, Caching, DB Resilience

### Input Validation (`src/lib/validation.ts`)

Zod schemas for:

- **Filter params**: entityId (positive int, required), state (enum CA|IN|PA|KS|MN, optional), formulary (enum OPEN|MANAGED|HMF, optional), dateStart/dateEnd (YYYYMMDD regex, optional), mony (enum M|O|N|Y, optional), groupId (string, optional), ndc (string, optional), manufacturer (string, optional), drug (string, optional), limit (positive int max 100, optional), includeFlaggedNdcs (boolean, optional)
- **Chat request**: messages (array of {role: enum, content: string}, max 10 items, max 4KB per content), data (object, optional)

Integrated into `parseFilters()` — the single entry point all 5 data routes already use. Chat route validates separately.

### Cache Headers

All read-only routes (`/api/overview`, `/api/claims`, `/api/anomalies`, `/api/filters`, `/api/entities`):

```
Cache-Control: public, s-maxage=300, stale-while-revalidate=600
```

Vercel edge caches for 5 min, serves stale for 10 min while revalidating. Data is static 2021 claims.

Chat route: `Cache-Control: no-store`

### DB Resilience (`src/lib/db-utils.ts`)

- Retry wrapper: 1 attempt + 2 retries with exponential backoff (200ms, 400ms)
- Query timeout: 10s via Neon client config
- Used by API routes for non-trivial queries

---

## Layer 3: UI Resilience — Error Boundaries, XSS Fix, Loading States

### Error Boundaries

- **`src/app/error.tsx`**: Page-level error boundary. Styled card with error message + "Try again" button (calls `reset()`). Uses existing teal design language. `'use client'` component.
- **`src/app/global-error.tsx`**: Root layout error catcher. Minimal self-contained HTML fallback (can't use layout components). `'use client'` component.

### Loading State

- **`src/app/(dashboard)/loading.tsx`** (or `src/app/loading.tsx` depending on route structure): Skeleton loader with animated pulse placeholders matching KPI card + chart grid layout.

### XSS Fix — Chat Sidebar

Replace 2x `dangerouslySetInnerHTML` in `src/components/chat-sidebar.tsx` with DOMPurify-sanitized HTML:

```tsx
import DOMPurify from 'isomorphic-dompurify';
// ...
dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatted) }}
```

Using `isomorphic-dompurify` (works in both Node.js SSR and browser).

### ARIA Enhancement

- Wrap chat message list in `<div aria-live="polite">` for screen reader announcements of new messages.

---

## Layer 4: Performance — Lighthouse Quick Wins

### Font Display

Add `display: 'swap'` to both font configs in `src/app/layout.tsx`:

```tsx
const outfit = Outfit({ variable: '--font-outfit', subsets: ['latin'], display: 'swap' });
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});
```

### Skip-to-Content Link

Add as first child of `<body>` in `layout.tsx`:

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-4 focus:text-teal-900"
>
  Skip to content
</a>
```

Add `id="main-content"` to `<main>`.

### NOT Doing

- Dynamic chart imports — causes visible layout shift, worse UX for demo
- Service worker / PWA — over-engineering
- Bundle analyzer — debugging tool, not shipping feature
- `next/image` — no raster images in app

---

## Summary of Changes

| File                              | Change                                  |
| --------------------------------- | --------------------------------------- |
| `next.config.ts`                  | Security headers                        |
| `src/middleware.ts`               | NEW — rate limiting + request logging   |
| `src/lib/validation.ts`           | NEW — Zod schemas for filters + chat    |
| `src/lib/parse-filters.ts`        | Integrate Zod validation                |
| `src/lib/db-utils.ts`             | NEW — retry wrapper with timeout        |
| `src/app/api/chat/route.ts`       | Input validation, no-store header       |
| `src/app/api/overview/route.ts`   | Cache headers (+ all other data routes) |
| `src/app/error.tsx`               | NEW — page error boundary               |
| `src/app/global-error.tsx`        | NEW — root error boundary               |
| `src/app/loading.tsx`             | NEW — skeleton loader                   |
| `src/components/chat-sidebar.tsx` | DOMPurify XSS fix, aria-live            |
| `src/app/layout.tsx`              | font-display swap, skip-to-content link |
| `package.json`                    | Add `zod`, `isomorphic-dompurify`       |

**New dependencies**: 2 (`zod` ~13KB gzip, `isomorphic-dompurify` ~7KB gzip)
**New files**: 5
**Modified files**: 8+
