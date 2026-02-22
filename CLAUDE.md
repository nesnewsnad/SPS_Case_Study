# SPS Health — AI Implementation Intern Case Study

## What This Is

A production-grade, interactive claims analytics dashboard for SPS Health's RFP evaluation. Analyzes Pharmacy A's 2021 claims data. Built as a multi-entity platform — Pharmacy A is entity #1, architecture supports onboarding additional pharmacy clients day one.

## Scoring Axes (from the case study brief)

1. **AI Proficiency** — how you leverage AI tools (process IS the deliverable)
2. **Data Storytelling** — patterns, trends, anomalies communicated clearly ("tell a story, not just display charts")
3. **Dashboard Design & Interactivity** — filters, drill-downs, layout, UX ("pseudo-Power BI")

## Deliverables

1. **Interactive Dashboard** — 4 views: Executive Overview, Claims Explorer, Anomalies & Recommendations, AI Process
2. **Follow-Up Questions & Next Steps** — embedded in Anomalies & Recommendations view
3. **Dashboard Extension Mock-Up** — placeholder panels with narrative in Anomalies & Recommendations view
4. **AI Process Documentation** — built as a real dashboard page, not a PDF

## Development Workflow

- **Architecture machine**: planning, design docs, session logs, specs, reviews
- **Implementation machine**: builds dashboard, tests, commits
- **Git**: coordination layer between machines
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

| Field           | Description                                |
| --------------- | ------------------------------------------ |
| ADJUDICATED     | True/False — adjudicated at point of sale  |
| FORMULARY       | OPEN / MANAGED / HMF                       |
| DATE_FILLED     | YYYYMMDD format, full year 2021            |
| NDC             | National Drug Code — join key to Drug_Info |
| DAYS_SUPPLY     | Integer, days of dispensed supply          |
| GROUP_ID        | 189 distinct groups                        |
| PHARMACY_STATE  | 5 states: CA, IN, PA, KS, MN               |
| MAILRETAIL      | 100% Retail (R) — no mail-order            |
| NET_CLAIM_COUNT | +1 = incurred, -1 = reversed               |

### Drug_Info.csv (~247K rows, tilde-delimited)

| Field             | Description                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------- |
| NDC               | National Drug Code — join key                                                                |
| DRUG_NAME         | Short-hand name                                                                              |
| LABEL_NAME        | Detailed / full name with strength/form                                                      |
| MONY              | M=multi-source brand, O=multi-source generic, N=single-source brand, Y=single-source generic |
| MANUFACTURER_NAME | 2,421 distinct manufacturers                                                                 |

### Join Coverage

- 5,640 unique NDCs in claims → 99.5% match to Drug_Info (30 unmatched)
- BOM character in Claims_Export.csv header — use `encoding='utf-8-sig'`

## Key Data Findings (verified EDA, 2026-02-19)

### Headline Numbers

- **596,090 total rows** (531,988 incurred, 64,102 reversed). Zero nulls in any column.
- **546,523 "real" rows** after excluding the Kryptonite test drug (see below).
- **5,640 unique NDCs** in claims → 5,610 match Drug_Info (99.5%), 30 unmatched (321 rows, 0.05%).
- **Drug_Info**: 246,955 rows, 246,955 unique NDCs (zero duplicates), zero nulls/empties.
- **189 GROUP_IDs — every single one is state-specific** (no group spans multiple states). Confidence: verified, 189/189 in exactly 1 state.
- **365 unique dates** — every day of 2021 has claims.
- **100% Retail (R)** — no mail-order. Expected for LTC pharmacy.

### ANOMALY 1: "Kryptonite XR" Test Drug (HIGH CONFIDENCE — deliberate Easter egg)

- **NDC 65862020190** = "KRYPTONITE XR" / "KINGSLAYER 2.0 1000mg" by "LEX LUTHER INC." (MONY=N)
- **49,567 claims (8.3% of dataset)**. Of these, **49,301 are in May** — May is 99.99% Kryptonite (only 5 real claims). The remaining 266 Kryptonite claims are scattered across other months (13-43/month).
- State/formulary/adjudication distributions mirror overall dataset proportions exactly — it's a synthetic injection matching the data's statistical profile.
- **Impact**: May is effectively a fake month. Exclude NDC 65862020190 from all real analysis. Monthly trend charts should either omit May or annotate it.
- **Evidence**: Fictional drug name, fictional manufacturer, 99.5% concentration in one month, perfectly mirrored distributions. This is almost certainly a test to see if the analyst catches it.

### ANOMALY 2: Kansas August Batch Reversal (HIGH CONFIDENCE — rebill event)

- **KS August**: 6,029 rows, **81.6% reversal rate** (4,921 reversed, net = -3,813).
- **Root cause**: 18 KS-only groups (all with "400xxx" prefix) have **100% reversal / zero incurred** in August = 4,790 rows. The remaining 1,239 KS Aug rows have a normal 10.6% reversal rate.
- **Pattern**: These 18 groups have normal claims in July (~10% reversal), then 100% reversal in August (zero new incurred), then re-incur in September at ~1.4-1.5x normal volume with normal reversal rates. Classic **batch reversal + rebill** — all July claims reversed in August, re-submitted in September.
- **Evidence**: GROUP 400127: Jul=1,210 rows (10.5% rev), Aug=1,194 rows (100% rev, 0 incurred), Sep=1,733 rows (9.8% rev). Same pattern for all 18 groups.
- **This is NOT a general "Kansas has high reversals" story**. KS in every other month has ~9.3-10.4% reversal rate, indistinguishable from other states. The 15.8% annual KS reversal rate reported earlier was entirely an artifact of the August batch event.

### ANOMALY 3: September Spike (+41% vs normal months) (MEDIUM CONFIDENCE — partially explained)

- **70,941 real claims** (excl. Kryptonite) vs. ~50,249 avg for the 9 normal months (excl. fake May, anomalous Sep/Nov). **+41% above normal-month average**.
- The spike is **perfectly uniform**: all 5 states up 40-42%, all 3 formularies up 41-42%, all top drugs up ~1.4x. No single group or drug drives it.
- **Partially explained**: KS rebill groups re-incurring in September adds ~2,700 extra claims. But the remaining ~23,000 excess claims are unexplained and uniformly distributed.
- **Sep 1 has 13,741 claims** — but this fits the first-of-month pattern (all months show ~7x volume on day 1 (6.8-7.8x range), a classic LTC cycle-fill pattern). Sep 1 is high in proportion, not anomalously so.
- **Possible explanations**: Q3-end catch-up processing, LTC facility re-enrollment cycle, or synthetic data amplification.

### ANOMALY 4: November Dip (-54% vs normal months) (MEDIUM CONFIDENCE — unexplained)

- **23,337 real claims** vs. ~50,249 normal-month avg. **-54% below normal**. All 30 days present, all 183 active groups present (6 tiny groups with 88 total claims absent — immaterial).
- The dip is **perfectly uniform**: all states down 53-55%, all top groups at ~0.45-0.54x normal. Not driven by missing groups, missing days, or a holiday gap.
- Nov 20-22 (Sat-Mon around Thanksgiving) are especially low (67-123 claims/day), but the deficit is spread across the entire month — every day is roughly half volume.
- **Possible explanations**: Data extract truncated mid-processing, reduced LTC admissions, or synthetic data artifact.

### Baseline Rates (remarkably uniform)

- **Reversal rate**: 10.81% overall (real claims). By state: CA 10.0%, IN 10.0%, KS 10.0% (excl. Aug batch), MN 10.0%, PA 10.2%. By formulary: OPEN 10.8%, MANAGED 10.7%, HMF 10.7%. By MONY: M 11.0%, O 11.0%, N 10.4%, Y 10.8%.
- **Adjudication rate**: 25.1% overall. Essentially flat across every dimension — state (25.0-25.2%), formulary (25.0-25.1%), month (24.2-26.5%). ~75% not adjudicated at POS — typical for LTC.
- **First-of-month cycle fills**: Day 1 of every month has ~7x the volume of an average day (6.8-7.8x range). Strong LTC signal.

### Drug Mix

- **MONY by claims volume (excl. Kryptonite)**: Y (generic single-source) 83.8%, N (brand single-source) 13.6%, O (generic multi-source) 1.5%, M (brand multi-source) 1.1%. Heavily generic — expected for LTC cost management. (With Kryptonite included: Y=76.8%, N=20.8% — do not use these numbers for real analysis; Kryptonite is MONY=N and inflates brand share.)
- **MONY by NDC count (drug_info)**: Y 60.4%, N 33.3%, O 5.8%, M 0.4%. Claims are more concentrated in generics than the drug universe would suggest.
- **Top real drugs (excl. Kryptonite)**: Atorvastatin 40mg (10,193), Pantoprazole 40mg (9,820), Tamsulosin 0.4mg (8,786), Hydrocodone-APAP 5-325mg (7,716), Eliquis 5mg (7,466). Mix of statins, GI, pain, anticoagulants — standard LTC elderly population.
- **Top manufacturers by volume**: Aurobindo (43K), Ascend (35K), Amneal (34K), Apotex (31K), Zydus (26K) — generic manufacturers dominate.

### Days Supply Distribution

- **Top values (excl. Kryptonite)**: 14 days (104K, 19%), 7 days (73K, 13%), 30 days (36K, 7%), 1 day (29K, 5%).
- **Buckets**: 1-7 days (224K, 38%), 8-14 days (203K, 34%), 15-30 days (144K, 24%), 31-60 days (24K, 4%), 61+ days (379, <0.1%).
- Short supply dominance confirms LTC — facilities dispense in 7-14 day cycles, not 90-day mail-order.
- **Mean**: 13.0 days, **Median**: 12 days, **Max**: 120 days.

### Groups

- **Top groups by volume (excl. Kryptonite)**: 6P6002 (17,016), 101320 (14,301), 400127 (13,558), 400132 (12,873), 6P6000 (12,681).
- Groups 400127 and 400132 have elevated annual reversal rates (17.3%) — entirely due to the August batch reversal event. Excluding August, their rates are ~10%.

### Additional Patterns

- **26th-of-month secondary cycle fill**: Day 26 of each month shows ~2.0-2.7x volume vs. average — a secondary LTC cycle-fill peak, likely corresponding to facilities with a different dispensing schedule offset from the 1st-of-month primary cycle.
- **Semi-synthetic data characteristics**: Formulary, adjudication, and reversal flags appear randomly assigned — their distributions are perfectly uniform across all dimensions (state, drug, group, month). Real PBM data would show correlations (e.g., certain drugs always on MANAGED formulary, adjudication varying by state). This suggests the dataset preserves real utilization patterns (drugs, groups, states, dates) but randomizes categorical flags.

### Unmatched NDCs

- 30 NDCs (321 claim rows) don't match Drug_Info. Top unmatched: NDC 37000002304 (116 claims), 8026420200 (63), 54629070090 (33). Likely OTC or non-drug items (NDC prefix 37000 is Procter & Gamble).

## Database Schema

See `docs/ARCHITECTURE.md` for full schema. Key design: `entity_id` on claims table makes this multi-tenant.

## API Routes

Server-side aggregation — never ship raw rows to the browser.

- `GET /api/overview` — KPI summary, monthly aggregates
- `GET /api/claims` — filtered aggregations for Explorer (drugs, groups, manufacturers, days supply, MONY)
- `GET /api/anomalies` — pre-computed anomaly breakdowns
- `GET /api/filters` — filter dropdown options (drugs, manufacturers, groups)
- `GET /api/entities` — list of onboarded entities
- `POST /api/chat` — AI chat streaming endpoint (Claude Haiku)

## Timeline

- **Thu night**: Scaffold, schema, seed, deploy skeleton
- **Fri**: Core dashboard (Overview + Explorer views)
- **Sat**: Anomalies view, narrative layer, filters
- **Sun**: AI Process page, extension mock-ups, polish
- **Mon**: QA, final deploy, submit
