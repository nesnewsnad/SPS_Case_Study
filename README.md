# SPS Health — Claims Analytics Dashboard

An interactive claims analytics dashboard analyzing Pharmacy A's 2021 prescription claims data. Built for SPS Health's AI Implementation Intern case study.

**Live:** [sps-case-study.vercel.app](https://sps-case-study.vercel.app)

## Dashboard Views

| View                            | Description                                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Executive Overview**          | KPI cards, monthly claims trend with anomaly annotations, formulary/state/adjudication breakdowns, narrative insight cards                  |
| **Claims Explorer**             | Full filter bar with cross-filtering — drill into drugs, groups, manufacturers, days supply, MONY classification. Every chart is clickable. |
| **Anomalies & Recommendations** | Deep-dive investigation panels for 4 discovered anomalies, follow-up questions, and extension mock-ups for future analysis                  |
| **AI Process**                  | How AI tools were used — pipeline visualization, prompt artifacts, toolkit decisions, and honest limitations                                |

An **"Ask the Data"** chat sidebar (powered by Claude Haiku) is available on every page for natural-language queries against the dataset.

## Key Analytical Findings

- **Kryptonite XR** — A fictional test drug ("KINGSLAYER 2.0 1000mg" by "LEX LUTHER INC.") injected into the data, comprising 8.3% of all claims and rendering May essentially fake. Detected and excluded from all real analysis.
- **Kansas August Batch Reversal** — 18 Kansas groups with 100% reversal rates in August, traced to a batch reversal + rebill cycle (July claims reversed in August, re-submitted in September).
- **September Volume Spike** — +41% above normal months, uniformly distributed across all dimensions. Partially explained by Kansas rebills.
- **November Volume Dip** — -54% below normal months, also perfectly uniform. Unexplained — possibly a data extract artifact.

## Tech Stack

| Layer      | Choice                       |
| ---------- | ---------------------------- |
| Framework  | Next.js 14 (App Router)      |
| Database   | Vercel Postgres (Neon)       |
| ORM        | Drizzle                      |
| UI         | Tailwind CSS + shadcn/ui     |
| Charts     | Recharts                     |
| AI Chat    | Vercel AI SDK + Claude Haiku |
| Deployment | Vercel                       |

## Running Locally

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add DATABASE_URL (Neon Postgres) and ANTHROPIC_API_KEY

# Push schema to database
npm run db:push

# Seed data from CSVs
npm run db:seed

# Start dev server
npm run dev
```

## Project Structure

```
src/
├── app/                    # Next.js pages + API routes
│   ├── api/                # Server-side aggregation endpoints
│   │   ├── overview/       # KPI summary, monthly aggregates
│   │   ├── claims/         # Filtered aggregations for Explorer
│   │   ├── anomalies/      # Pre-computed anomaly breakdowns
│   │   ├── drugs/          # Top drugs with counts and rates
│   │   ├── entities/       # Onboarded entity list
│   │   └── chat/           # AI chat streaming endpoint
│   ├── explorer/           # Claims Explorer page
│   ├── anomalies/          # Anomalies & Recommendations page
│   └── process/            # AI Process page
├── components/             # React components by domain
├── contexts/               # FilterContext (URL-synced state)
├── db/                     # Drizzle schema + connection
├── hooks/                  # Custom React hooks
└── lib/                    # Utilities, formatters, validation
    └── __tests__/          # Vitest unit tests

docs/
├── specs/                  # Technical specifications (SPEC-001–006)
├── plans/                  # Design decisions + implementation plans
├── sessions/               # Development session logs
├── ARCHITECTURE.md         # Schema, API design, tech decisions
└── WORKFLOW.md             # Development methodology

tests/                      # Python data validation tests (69 tests)
```

## Architecture Highlights

- **Multi-entity from day one** — `entity_id` on the claims table supports onboarding additional pharmacy clients without schema changes.
- **Server-side aggregation** — API routes perform all SQL aggregation; the browser never receives raw claim rows.
- **Cross-filtering** — Clicking any chart element (month, state, formulary, drug, etc.) applies filters across all views via URL-synced state.
- **Production hardening** — CSP headers, rate limiting, Zod input validation, DOMPurify output sanitization, error boundaries, retry logic.

## Testing

```bash
# TypeScript unit tests (Vitest)
npm test

# Python data validation tests
python -m pytest tests/ -v
```

## Documentation

- [`CLAUDE.md`](./CLAUDE.md) — AI context document with full data findings and project architecture
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — Technical decisions and database schema
- [`docs/specs/`](./docs/specs/) — Specifications for each dashboard component (SPEC-001 through SPEC-006)
- [`docs/plans/`](./docs/plans/) — Design documents and implementation plans
- [`docs/sessions/`](./docs/sessions/) — Development session logs showing methodology
