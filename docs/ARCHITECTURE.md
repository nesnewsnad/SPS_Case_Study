# Architecture — SPS Health Claims Dashboard

## Decision Record (2026-02-19)

### Vision
Not a case study demo — a production prototype that SPS Health could onboard Pharmacy B with tomorrow. Multi-entity from day one.

### Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server components, API routes, Vercel-native. Need server-side for DB queries and CSV ingestion. |
| Database | Vercel Postgres (Neon) | Zero-config with Vercel, Postgres natural for analytics, serverless, free tier |
| ORM | Drizzle | Lightweight, type-safe, SQL-close. Not Prisma's heavy abstraction. |
| UI | Tailwind CSS + shadcn/ui | Production-grade components fast. Cards, tabs, selects, sidebar, data tables. |
| Charts | Recharts | React-native, flexible, well-maintained, good default aesthetics |
| Deployment | Vercel | One push, live URL, preview deploys on every commit |

### Database Schema

Multi-entity design — Pharmacy A is entity #1, schema supports N entities.

```
entities
  id          SERIAL PRIMARY KEY
  name        VARCHAR(255) NOT NULL
  description TEXT
  created_at  TIMESTAMP DEFAULT NOW()

drug_info
  ndc               VARCHAR(20) PRIMARY KEY
  drug_name         VARCHAR(255)
  label_name        TEXT
  mony              CHAR(1)           -- M, O, N, Y
  manufacturer_name VARCHAR(255)

claims
  id              SERIAL PRIMARY KEY
  entity_id       INTEGER → entities(id)
  adjudicated     BOOLEAN
  formulary       VARCHAR(20)        -- OPEN, MANAGED, HMF
  date_filled     DATE
  ndc             VARCHAR(20) → drug_info(ndc)
  days_supply     INTEGER
  group_id        VARCHAR(50)
  pharmacy_state  CHAR(2)
  mail_retail     CHAR(1)            -- M or R
  net_claim_count SMALLINT           -- +1 or -1

Indexes on: entity_id, date_filled, pharmacy_state, formulary, ndc, group_id, mony, manufacturer_name
```

### Dashboard Structure (4 Views)

1. **Executive Overview** — KPI cards, monthly trend with anomaly annotations, adjudication/formulary/state breakdowns. Narrative callouts baked into charts.

2. **Claims Explorer** — Full filter bar (formulary, state, MONY, manufacturer, drug, group, date range). Every chart cross-filters. Top drugs table, days supply distribution, reversal analysis.

3. **Anomalies & Recommendations** — Deep-dive panels for Sept spike, Nov dip, KS reversals. Follow-up questions (client, internal, data requests). Extension mock-up with placeholder panels.

4. **AI Process** — Tool selection, architecture decisions, key prompts, iterations, limitations. Built as a dashboard page, not a PDF.

### API Design

Server-side aggregation — never ship raw rows to the browser.

```
GET /api/overview?entityId=1
  → KPI summary, monthly aggregates, adjudication rates

GET /api/claims?entityId=1&formulary=OPEN&state=CA&mony=O&...
  → Filtered aggregations for Explorer view

GET /api/anomalies?entityId=1
  → Pre-computed anomaly breakdowns

GET /api/drugs?entityId=1&sort=volume&limit=20
  → Top drugs with claim counts, reversal rates

GET /api/entities
  → List of onboarded entities
```

### Data Pipeline

1. Python preprocessing script validates and cleans CSVs
2. TypeScript seed script loads into Postgres via Drizzle
3. Admin/upload view demonstrates the pattern for adding new entities

### What's Out of Scope (3.5 days)

- Auth / user accounts
- Real-time data
- Mobile responsiveness (desktop-only — they'll review on desktop)
- Dark mode
- CSV upload actually processing (mock the flow, explain the pattern)
- Animations beyond hover states
