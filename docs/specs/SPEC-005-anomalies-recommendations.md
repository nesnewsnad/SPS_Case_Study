# SPEC-005 — Anomalies & Recommendations Page

**Date:** 2026-02-20
**Status:** DRAFT
**Dependencies:** SPEC-001 (API routes — `/api/anomalies`), SPEC-002 (FilterContext — not used for filtering here, but sidebar nav must work)
**Context:** Case study brief deliverables #2 (Follow-Up Questions), #3 (Dashboard Extension Mock-Up); CLAUDE.md anomaly findings

---

## Problem

The Anomalies & Recommendations page is the analytical narrative layer — where we prove we understand the data, not just display it. The API already returns 4 richly structured anomaly panels with narratives, mini-chart data, and before/after comparisons. The current page is a static placeholder with hardcoded text and empty chart boxes. This spec turns it into the most impressive page in the dashboard.

This page has three sections:

1. **Anomaly Investigation Panels** — 4 deep-dive cards with charts and narratives
2. **Follow-Up Questions** — organized by audience (client, internal, data requests)
3. **Dashboard Extension Mock-Ups** — 4 forward-looking feature panels with written narratives

---

## Behavior

### Page Structure

```
┌──────────────────────────────────────────────────────────────┐
│ Page Header                                                   │
│ "Anomalies & Recommendations"                                 │
│ "Pharmacy A — Data Quality Findings, Follow-Up Questions,     │
│  & Forward-Looking Analysis"                                   │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ SECTION 1: Anomaly Investigation Panels                     │ │
│ │                                                              │ │
│ │  [Panel 1: Kryptonite XR — Synthetic Test Drug]             │ │
│ │  [Panel 2: September Volume Spike]                          │ │
│ │  [Panel 3: November Volume Dip]                             │ │
│ │  [Panel 4: Kansas August Batch Reversal]                    │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ SECTION 2: Follow-Up Questions (3 tabs)                     │ │
│ │  [Client Questions | Internal Team | Data Requests]         │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ SECTION 3: Dashboard Extension Mock-Ups                     │ │
│ │  2×2 grid of future feature panels                          │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

### Page Header

- Title: **"Anomalies & Recommendations"** (text-2xl font-semibold)
- Subtitle: **"Pharmacy A — Data Quality Findings, Follow-Up Questions, & Forward-Looking Analysis"** (text-muted-foreground)
- No FilterBar on this page — anomalies are pre-computed, not filterable

### Data Fetching

Single fetch to `GET /api/anomalies?entityId=1`:

```typescript
fetch('/api/anomalies?entityId=1').then((res) => res.json()); // AnomaliesResponse
```

- Fetch on mount (entityId is hardcoded to 1 for now — multi-entity ready)
- While loading: skeleton shimmers for all panels
- On error: error state with retry button (same pattern as Overview/Explorer)

---

## Section 1: Anomaly Investigation Panels

Four cards rendered from `AnomaliesResponse.panels[]`. Each panel is a full investigation — not just a chart, but a structured analytical narrative.

### Panel Layout (each card)

```
┌────────────────────────────────────────────────────────────┐
│ ┌──────────┐                                                │
│ │ KEY STAT │  Panel Title                       [Severity]  │
│ └──────────┘                                                │
├────────────────────────────────────────────────────────────┤
│                                                              │
│ WHAT WE SEE                                                  │
│ <whatWeSee text — the observation>                            │
│                                                              │
│ ┌──────────────────────┐  ┌──────────────────────┐          │
│ │ Mini Chart 1          │  │ Mini Chart 2          │          │
│ │                        │  │                        │          │
│ └──────────────────────┘  └──────────────────────┘          │
│                                                              │
│ [Before/After Table — Kryptonite panel only]                 │
│                                                              │
│ WHY IT MATTERS                                               │
│ <whyItMatters text — the analysis>                           │
│                                                              │
│ TO CONFIRM                                                   │
│ <toConfirm text — question for the client>                   │
│                                                              │
│ RFP IMPACT                                                   │
│ <rfpImpact text — why this matters for the evaluation>       │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

### Panel Header

- **Key Stat**: large monospace number in a colored pill/badge. Color by panel:
  - Kryptonite: amber (data quality)
  - Sept spike: red (anomaly — positive direction)
  - Nov dip: red (anomaly — negative direction)
  - KS batch: amber (operational)
- **Title**: `panel.title` — bold, prominent
- **Severity Badge**: Kryptonite = "Data Quality", Sept/Nov = "Volume Anomaly", KS Aug = "Operational"

### Narrative Sections

Four labeled text blocks per panel, rendered from the API response fields:

| Label          | Field          | Style                                                                                                                    |
| -------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| What We See    | `whatWeSee`    | Normal text, the factual observation                                                                                     |
| Why It Matters | `whyItMatters` | Normal text, the analytical interpretation                                                                               |
| To Confirm     | `toConfirm`    | Slightly different style — this is a question directed at the client. Use a subtle left border or quote-style treatment. |
| RFP Impact     | `rfpImpact`    | Italic or accent color — this is a meta-comment about why detecting this matters for the RFP evaluation                  |

### Mini Charts

Each panel has 1-3 mini charts in `panel.miniCharts[]`. Render dynamically based on `type`:

**`type: 'bar'`** — Simple vertical bar chart (Recharts `BarChart`):

- Data has `month` + one numeric key (`claims`, `total`, or `reversalRate`)
- Auto-detect the numeric key (the one that isn't `month`)
- Teal bars for volume, amber bars for reversal rates
- Compact: ~200px tall, abbreviated axes

**`type: 'grouped-bar'`** — Grouped bar chart:

- Data has a category key (`state`, `formulary`, or `group`) + 2-3 numeric keys
- Render bars side by side for each numeric key
- Color coding: primary metric in teal, `average` in gray, month-specific in accent color
- For the Jul/Aug/Sep pattern chart (KS batch groups), use green/red/blue

**`type: 'stacked-bar'`** — Same as grouped-bar but stacked. Use if there are more than 3 series.

Charts sit in a responsive grid: 1 chart = full width, 2 charts = side by side, 3 charts = first full width + second two side by side.

### Before/After Table (Kryptonite panel only)

`panel.beforeAfter[]` — a comparison table showing impact of excluding the test drug:

| Metric       | With Kryptonite | Without Kryptonite |
| ------------ | --------------- | ------------------ |
| Total Claims | 596,090         | 546,523            |
| May Volume   | 49,572          | 5                  |
| ...          | ...             | ...                |

- Use shadcn `Table` component
- "With Kryptonite" column in red/amber tint
- "Without Kryptonite" column in green/teal tint
- This table only renders when `panel.beforeAfter` exists

---

## Section 2: Follow-Up Questions

A tabbed card with three tabs. Content is static (not from API) — these are the analyst's follow-up questions derived from the data findings.

### Tab Structure

Use shadcn `Tabs` component (add if not installed: `npx shadcn@latest add tabs`).

**Tab 1: Client Questions** — Questions for the pharmacy client

- Is Kryptonite XR (NDC 65862020190) a known test record? Should it be permanently excluded?
- What caused the Kansas batch reversal event in August 2021? Was there a system migration or billing correction?
- Was there a known operational event in September 2021 that would explain a 41% uniform volume increase?
- Is the November volume dip (~54% below normal) expected, or does it indicate a data extract issue?
- Are there additional data dimensions (cost, patient demographics, diagnosis codes) that could enrich this analysis?

**Tab 2: Internal Team** — Questions for the SPS Health analytics team

- Should flagged/test NDCs be automatically excluded from all standard reporting, or configurable per client?
- How should batch reversal events be normalized for trend analysis — exclude the reversal month, or spread the volume adjustment across the rebill window?
- What is the appropriate baseline period for anomaly detection — rolling 12-month, same-month-prior-year, or peer group comparison?
- Should the September spike be flagged as a data quality issue or accepted as legitimate volume variation?
- What threshold should trigger automatic anomaly alerts (e.g., >2σ deviation from rolling average)?

**Tab 3: Data Requests** — Additional data needed for deeper analysis

- Claims cost/reimbursement data — enables pricing analysis, cost-per-claim trends, and formulary cost comparison
- Patient-level identifiers (de-identified) — enables utilization patterns, polypharmacy detection, and adherence metrics
- Prior authorization and step therapy data — explains some reversal patterns and formulary management effectiveness
- Historical data (2019-2020) — enables year-over-year comparison and trend validation
- Facility-level identifiers — distinguishes SNF vs. ALF vs. other LTC settings for benchmarking

Each tab renders as a numbered list with explanatory text per item.

---

## Section 3: Dashboard Extension Mock-Ups

Four cards in a 2×2 grid. Each card represents a future feature that could be built with additional data. These are **mock-ups with written narratives** — the brief says "both visual and written."

### Mock-Up Card Layout

```
┌────────────────────────────────────────┐
│ ┌──────┐                                │
│ │ Icon │  Feature Title       [FUTURE]  │
│ └──────┘                                │
│                                          │
│ Visual Mock-Up Area (~200px)             │
│ (stylized placeholder showing the       │
│  concept — NOT a gray empty box)        │
│                                          │
│ Written Narrative                        │
│ 2-3 sentences explaining what this      │
│ feature would do, what data it needs,   │
│ and what value it provides.             │
│                                          │
│ Data Requirements                        │
│ Bullet list of what's needed            │
└────────────────────────────────────────┘
```

### The Four Mock-Ups

**1. Client Onboarding & Comparison**

- **Icon**: Users or Building2 (lucide)
- **Visual**: A side-by-side KPI comparison layout showing "Pharmacy A" vs "Pharmacy B" with overlay trend lines and benchmark bars — use muted/skeleton-style rendering to show it's a concept
- **Narrative**: "The multi-entity architecture is already in place — `entity_id` on every claims row supports onboarding additional pharmacy clients day one. Upload a CSV, auto-ingest, and immediately compare KPIs, overlay monthly trends, and benchmark reversal rates across clients. No schema changes required."
- **Data needed**: Additional client CSV exports in the same format

**2. Pricing & Reimbursement Overlay**

- **Icon**: DollarSign or TrendingUp (lucide)
- **Visual**: A chart area showing cost-per-claim trend lines overlaid on the volume bars — mockup style
- **Narrative**: "Layering cost data onto utilization reveals whether high-volume drugs are also high-cost, identifies pricing outliers, and enables AWP vs. reimbursement spread analysis. Combined with formulary tier data, this powers contract negotiation intelligence."
- **Data needed**: AWP/WAC pricing, reimbursement amounts, dispensing fees

**3. Patient Demographics & Utilization**

- **Icon**: HeartPulse or Activity (lucide)
- **Visual**: Age/gender pyramid or stratification bars — mockup style
- **Narrative**: "Patient-level data (de-identified) unlocks utilization patterns: polypharmacy rates, medication adherence, therapy switching, and high-risk patient identification. For LTC populations, age and diagnosis stratification drives clinical intervention targeting."
- **Data needed**: De-identified patient IDs, age, gender, diagnosis codes (ICD-10)

**4. Automated Anomaly Detection**

- **Icon**: AlertTriangle or Radar (lucide)
- **Visual**: A timeline/sparkline with colored anomaly markers (red dots for detected anomalies) — mockup style
- **Narrative**: "A statistical engine that runs on every data ingestion: flags volume deviations >2σ from rolling baseline, detects batch reversal patterns automatically, identifies test/dummy records by distribution analysis, and alerts on new NDCs not in the drug reference. Every anomaly found in this analysis was detectable programmatically."
- **Data needed**: Automated pipeline access, historical baseline data, configurable alert thresholds

### Visual Mock-Up Treatment

The visual areas should NOT be empty gray boxes. Use one of these approaches:

- **Skeleton-with-structure**: Render the actual chart component types with fake/placeholder data and a frosted-glass overlay + "Coming Soon" or "FUTURE" badge
- **Stylized wireframe**: Thin-lined chart outlines with dashed borders and muted colors that suggest the layout without being mistaken for real data
- **Concept illustration**: Use CSS shapes/gradients to suggest the visualization type

The key is that it looks intentionally designed, not unfinished.

---

## File Structure

```
src/
  app/
    anomalies/
      page.tsx                              # Anomalies & Recommendations (replaces placeholder)
  components/
    anomalies/
      anomaly-panel.tsx                     # Single investigation panel (reusable for all 4)
      anomaly-mini-chart.tsx                # Dynamic chart renderer (bar/grouped-bar/stacked-bar)
      before-after-table.tsx                # Before/after comparison table (Kryptonite)
      follow-up-questions.tsx               # Tabbed follow-up questions
      extension-mockup.tsx                  # Single extension mock-up card
```

Component organization at implementor's discretion.

---

## Acceptance Criteria

1. Anomalies page at `/anomalies` fetches `GET /api/anomalies?entityId=1` and renders all three sections
2. Page has no FilterBar — anomalies are pre-computed narratives, not filterable data
3. All 4 anomaly investigation panels render with title, key stat badge, severity badge
4. Each panel displays all 4 narrative sections: What We See, Why It Matters, To Confirm, RFP Impact
5. Mini charts render dynamically from `panel.miniCharts[]` — bar charts for `type: 'bar'`, grouped bars for `type: 'grouped-bar'`
6. Kryptonite panel renders a before/after comparison table from `panel.beforeAfter[]`
7. Follow-up questions section has 3 tabs (Client Questions, Internal Team, Data Requests) using shadcn Tabs
8. Each tab contains 5 numbered, substantive questions with explanatory context
9. Four dashboard extension mock-up cards render in a 2×2 grid
10. Each mock-up card has: icon, title, "FUTURE" badge, visual mock-up area (not an empty gray box), written narrative, and data requirements list
11. Mock-up visuals are intentionally designed (skeleton-with-structure, stylized wireframe, or concept illustration) — not blank placeholders
12. Skeleton loading states for all sections while data loads
13. Error state with retry button if API fails
14. Page is scrollable, no horizontal overflow, all text is readable without truncation

---

## Non-Goals

- Filtering or cross-filtering on this page (anomalies are pre-computed)
- Real-time anomaly detection (the mock-up describes it; we don't build it)
- Functional extension features (they're mock-ups with narratives)
- Interactive chart exploration on mini charts (no tooltips required, but acceptable)
- Insight cards (the panels themselves ARE the insights on this page)
- AI-generated analysis (narratives are pre-written in the API, not generated on-the-fly)
- Dark mode
- Mobile/responsive layout
