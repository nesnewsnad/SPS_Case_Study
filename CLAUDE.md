# SPS Health — AI Implementation Intern Case Study

## What This Is
A production-grade, interactive claims analytics dashboard for SPS Health's RFP evaluation. Analyzes Pharmacy A's 2021 claims data. Built as a multi-entity platform — Pharmacy A is entity #1, architecture supports onboarding additional pharmacy clients day one.

**This needs to win.** State-of-the-art design, analytical depth, domain fluency. Not a homework assignment — a product they could deploy.

## Scoring Axes (from the case study brief)
1. **AI Proficiency** — how you leverage AI tools (process IS the deliverable)
2. **Data Storytelling** — patterns, trends, anomalies communicated clearly ("tell a story, not just display charts")
3. **Dashboard Design & Interactivity** — filters, drill-downs, layout, UX ("pseudo-Power BI")

## Deliverables
1. **Interactive Dashboard** — 4 views: Executive Overview, Claims Explorer, Anomalies & Recommendations, AI Process
2. **Follow-Up Questions & Next Steps** — embedded in Anomalies & Recommendations view
3. **Dashboard Extension Mock-Up** — placeholder panels with narrative in Anomalies & Recommendations view
4. **AI Process Documentation** — built as a real dashboard page, not a PDF

## Dual Machine Architecture
- **Mac**: architecture, planning, design docs, session logs, narrative content, specs, reviews
- **Framework Desktop**: implementation, builds dashboard, tests, commits
- **Git**: coordination layer (remote: github.com/nesnewsnad/SPS_Case_Study)
- **Rule**: writer/reviewer separation — whoever wrote the code doesn't verify it

## Tech Stack
- **Framework**: Next.js 14 (App Router) — server components, API routes, Vercel-native
- **Database**: Vercel Postgres (Neon) — multi-entity from day one
- **ORM**: Drizzle — lightweight, type-safe, SQL-close
- **UI**: Tailwind CSS + shadcn/ui — production-grade components
- **Charts**: Recharts — React-native, flexible
- **Deployment**: Vercel — live URL, preview deploys

## Data Architecture

### Claims_Export.csv (~596K rows, tilde-delimited)
| Field | Description |
|---|---|
| ADJUDICATED | True/False — adjudicated at point of sale |
| FORMULARY | OPEN / MANAGED / HMF |
| DATE_FILLED | YYYYMMDD format, full year 2021 |
| NDC | National Drug Code — join key to Drug_Info |
| DAYS_SUPPLY | Integer, days of dispensed supply |
| GROUP_ID | 189 distinct groups |
| PHARMACY_STATE | 5 states: CA, IN, PA, KS, MN |
| MAILRETAIL | 100% Retail (R) — no mail-order |
| NET_CLAIM_COUNT | +1 = incurred, -1 = reversed |

### Drug_Info.csv (~247K rows, tilde-delimited)
| Field | Description |
|---|---|
| NDC | National Drug Code — join key |
| DRUG_NAME | Short-hand name |
| LABEL_NAME | Detailed / full name with strength/form |
| MONY | M=multi-source brand, O=multi-source generic, N=single-source brand, Y=single-source generic |
| MANUFACTURER_NAME | 2,421 distinct manufacturers |

### Join Coverage
- 5,640 unique NDCs in claims → 99.5% match to Drug_Info (30 unmatched)
- BOM character in Claims_Export.csv header — use `encoding='utf-8-sig'`

## Key Data Findings (from EDA)
- **September spike**: 70,984 claims (+43% vs ~50K avg) — unexplained
- **November dip**: 23,350 claims (-54%) — unexplained
- **Kansas reversals**: 15.8% vs ~10% all other states
- **100% retail**: no mail-order claims (expected for LTC)
- **75% not adjudicated at POS**: typical for LTC but worth flagging
- **Short days-supply dominance**: 14, 7, 30 days most common (LTC pattern)
- **Formulary reversal rates**: consistent ~10.7% across OPEN/MANAGED/HMF

## Database Schema
See `docs/ARCHITECTURE.md` for full schema. Key design: `entity_id` on claims table makes this multi-tenant.

## API Routes
Server-side aggregation — never ship raw rows to the browser.
- `GET /api/overview` — KPI summary, monthly aggregates
- `GET /api/claims` — filtered aggregations for Explorer
- `GET /api/anomalies` — pre-computed anomaly breakdowns
- `GET /api/drugs` — top drugs with counts and rates
- `GET /api/entities` — list of onboarded entities

## Timeline
- **Thu night**: Scaffold, schema, seed, deploy skeleton
- **Fri**: Core dashboard (Overview + Explorer views)
- **Sat**: Anomalies view, narrative layer, filters
- **Sun**: AI Process page, extension mock-ups, polish
- **Mon**: QA, final deploy, submit

## Context Management
- Start every session with `/open-session`
- Use `/continue-here` when context degrades or switching tasks
- End every session with `/close-session`

# currentDate
Today's date is 2026-02-19.

      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.
