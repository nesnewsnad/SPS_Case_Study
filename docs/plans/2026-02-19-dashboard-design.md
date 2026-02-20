# Dashboard Design — SPS Health Claims Analytics

**Date:** 2026-02-19
**Status:** LOCKED — ready for specs
**Quality bar:** Enterprise-grade. Indistinguishable from a paid product.

---

## Design Decisions (All Locked)

| # | Decision | Choice |
|---|---|---|
| 1 | Cross-filtering | Full — click any chart element, all charts re-filter |
| 2 | Narrative layer | Dynamic insight cards, filter-responsive |
| 3 | KPIs | Total Claims, Net Claims, Reversal Rate, Unique Drugs |
| 4 | Hero chart | Stacked area — incurred vs reversed |
| 5 | Color palette | Healthcare professional (navy/teal/amber) |
| 6 | Filter UX | Horizontal bar + chip pills, sticky, URL-synced |
| 7 | Secondary charts | Horizontal bars + donut + gauge |
| 8 | Anomalies page | Investigation panels with mini charts |
| 9 | Explorer page | Drug-centric table + distribution charts |
| 10 | AI Process page | Interactive journey timeline + workflow methodology |
| 11 | Extensions | Pricing + demographics + formulary tiers |
| 12 | Narrative tone | Consultant analyst |
| 13 | Quality bar | Enterprise-grade, indistinguishable from paid product |

---

## Architecture & Information Flow

Next.js 14 App Router on Vercel. Vercel Postgres (Neon). Four views via left sidebar: Executive Overview, Claims Explorer, Anomalies & Recommendations, AI Process.

### Data Flow
CSV → seed script (Drizzle) → Postgres. All views query server-side API routes that aggregate in SQL. Raw rows never reach the browser.

### API Filter Contract
Every API route accepts a unified filter parameter set:
- `entityId`, `formulary`, `state`, `mony`, `manufacturer`, `drug`, `ndc`, `dateStart`, `dateEnd`, `groupId`

### Filter State Architecture
React context (`FilterContext`) holds active filters as a key-value map. Any component can read (for API calls) or write (on chart click or dropdown select). Active filters render as removable chip pills in the sticky filter bar.

Filters sync to URL query params (`?state=CA&formulary=OPEN`). Shareable, bookmarkable views.

### Cross-Filtering Contract
Every clickable chart element calls `setFilter(dimension, value)`. If filter exists, clicking again removes it (toggle). This gives Power BI-like "click anywhere to drill down."

### Multi-Entity
`entity_id` on claims table. Pharmacy A = entity 1. Entity selector visible in sidebar but locked to Pharmacy A. Pattern demonstrated, ready for Pharmacy B.

---

## Color Palette

```
Primary:     #1e3a5f  (deep navy)     — sidebar, headers, secondary series
Accent:      #0d9488  (teal)          — primary series, positive, active states
Warning:     #d97706  (amber)         — anomaly highlights, September spike
Danger:      #dc2626  (red)           — reversals only, used sparingly
Success:     #059669  (emerald)       — positive deltas
Background:  #f8fafc  (slate-50)      — page background
Cards:       #ffffff                  — card surfaces
Text:        #0f172a  (slate-900)     — body text
Muted:       #64748b  (slate-500)     — axis labels, secondary text

Chart categorical palette (in order):
  #0d9488  teal
  #1e3a5f  navy
  #8b5cf6  violet
  #d97706  amber
  #64748b  slate
```

### Color Rules
- Teal = primary data, positive metrics, active UI states
- Navy = secondary data, structural UI elements
- Amber = anomalies, warnings — September spike is always amber
- Red = reversals ONLY — used sparingly for maximum impact
- Slate = muted/comparison data, axis labels, borders

---

## Typography

- **Geist Sans** — all UI text, labels, narrative content
- **Geist Mono** — KPI values, data numbers, chart tooltips
- Numbers always formatted: commas (596,437), one-decimal percentages (10.1%), abbreviated axes (50K)

---

## View 1: Executive Overview

Landing page. First impression. Must immediately communicate domain fluency.

### Header
"Executive Overview" / "Pharmacy A — 2021 Claims Utilization Summary"

### Filter Bar (sticky)
Dropdowns: Formulary, State, MONY, Date Range. Active filters as removable chip pills. Clear All button. Persists while scrolling.

### KPI Row (4 cards)
| Total Claims | Net Claims | Reversal Rate | Unique Drugs |
|---|---|---|---|
| 596,437 | ~536K | ~10.1% | 5,640 |

- Each re-calculates when filters active
- Delta indicator (vs. average when filtered)
- Reversal rate in amber if above threshold
- Geist Mono for the hero number, Geist Sans for the label

### Row 2
- **Hero chart (4/7 width):** Stacked area — monthly incurred vs reversed claims. Reference lines marking September spike (amber, ▲) and November dip (labeled, ▼). Clickable — select a month to filter.
- **Formulary donut (3/7 width):** OPEN / MANAGED / HMF proportions. Clickable slices = cross-filter.

### Row 3
- **State horizontal bars (1/2 width):** CA, IN, PA, KS, MN ranked by net claims. Clickable bars. KS bar subtly highlighted if reversal rate anomaly detected.
- **Adjudication gauge (1/2 width):** Radial gauge showing 75% non-adjudicated. Dramatic visual with brief LTC context note beneath.

### Dynamic Insight Cards
Appear below relevant charts. Context-sensitive:
- **No filters:** Top-level story — volume scale, LTC patterns, 100% retail callout, seasonality summary.
- **State filtered:** State-specific insights (KS → reversal anomaly, CA → largest volume).
- **Month filtered:** Monthly anomaly context (September → spike investigation, November → dip).

Consultant-analyst tone: "September claims surged 43% above the monthly average, driven primarily by CA and PA. This level of volume volatility has direct implications for capacity planning and pricing models in the RFP."

---

## View 2: Claims Explorer

The drill-down page. Every dimension from the brief is accessible here.

### Filter Bar (expanded)
All Overview filters PLUS: Drug Name (searchable), Manufacturer (searchable), Group ID (searchable), Mail/Retail toggle. Extra dimensions only on Explorer.

### Mini Monthly Trend (full width, ~150px tall)
Compact stacked area reacting to all active filters. Temporal context while drilling. Clickable month ranges.

### Three-Column Content Area

**Column 1 — Top 20 Drugs (sortable table):**
- Columns: Drug Name, NDC, Net Claims, Reversal Rate %, Formulary, Top State
- Default sort: net claims descending
- Click any row → adds drug as filter pill, all charts re-render
- Pagination: show top 20 / 50 / all toggle

**Column 2 — Days Supply Distribution:**
- Histogram with bins at 7, 14, 30, 60, 90 days
- Clickable bars → filter to supply range
- Should show LTC pattern (short supply dominance)

**Column 3 — MONY Breakdown:**
- Donut chart: M (brand multi), O (generic multi), N (brand single), Y (generic single)
- Clickable segments → cross-filter
- Shows brand vs generic mix

### Additional Explorer Charts (below main content)
- **Top 10 Groups by Volume:** Horizontal bar chart. Clickable → filter to group.
- **Top 10 Manufacturers by Volume:** Horizontal bar chart. Clickable → filter to manufacturer.

### Dynamic Insight Card
Below the table. Default: "Generics (MONY O+Y) account for X% of claims, consistent with LTC formulary management patterns." Updates with filter context.

---

## View 3: Anomalies & Recommendations

Analytical depth page. Three stacked sections.

### Section A: Investigation Panels (3 anomalies)

Collapsible accordions. First expanded by default.

**Panel structure (each anomaly):**
- **Header:** Anomaly name + key stat badge (e.g., "+43%")
- **WHAT WE SEE:** One sentence + mini comparison chart
- **WHY IT MATTERS:** 2-3 sentences, RFP framing, consultant-analyst tone
- **TO CONFIRM:** Specific validation question
- **RFP IMPACT:** One concrete recommendation

**Anomaly 1 — September Volume Spike (+43%)**
- Mini charts: September by state (grouped bar), September by formulary (stacked bar)
- Hypothesis: seasonal enrollment event or formulary change
- RFP impact: volume volatility affects pricing models, need guarantees

**Anomaly 2 — November Volume Dip (-54%)**
- Mini charts: November by state, November by group (which groups dropped off?)
- Hypothesis: holiday-related processing delay, data lag, or facility closures
- RFP impact: need to understand if this is predictable seasonality

**Anomaly 3 — Kansas Reversal Rate (15.8%)**
- Mini chart: reversal rate by state (bar chart, KS highlighted in amber)
- Hypothesis: pharmacy-level operational issue, different PBM adjudication rules
- RFP impact: reversals = cost, need to understand root cause before pricing

### Section B: Follow-Up Questions (tabbed)

Three tabs: **For the Client** | **For Internal Teams** | **Additional Data Requests**

Each tab: 4-6 bulleted questions grounded in specific data findings. Not generic "tell us more" — each question references a number or pattern from the analysis.

**For the Client (Pharmacy A):**
- What drove the September enrollment spike? One-time or recurring?
- Are Kansas reversals a known issue? Different PBM or adjudication process?
- Is the November dip a processing delay or actual volume reduction?
- What formulary management strategy drives the OPEN/MANAGED/HMF split?
- Are there plans to add mail-order capabilities?

**For Internal Teams (SPS Health):**
- What reversal rate threshold do we use for pricing risk assessment?
- How does this volume profile compare to similar LTC pharmacy clients?
- What capacity would we need for the September-like volume spikes?
- Do our network agreements cover all 5 pharmacy states equally?

**Additional Data Requests:**
- AWP/WAC pricing data to calculate cost-per-claim and generic savings
- Patient demographics (age, condition) for risk stratification
- Formulary tier details for preferred/non-preferred analysis
- Historical data (2019-2020) for year-over-year trend validation
- Reimbursement rates to assess margin by drug category

### Section C: Extension Mock-Up (3 placeholder panels)

Each panel: dashed border, grayed-out placeholder chart with sample data, 2-3 sentence narrative.

**Panel 1 — With Pricing Data:**
- Placeholder: cost trend line chart (mock data)
- "Adding AWP/WAC pricing would reveal cost-per-claim trends, identify generic substitution savings opportunities, and enable margin analysis by formulary type. We estimate this dataset would surface $X.XM in optimization potential."

**Panel 2 — With Patient Demographics:**
- Placeholder: age cohort bar chart (mock data)
- "Age and condition data would enable risk stratification, polypharmacy detection, and chronic disease management insights. Combined with claims data, this unlocks per-patient cost trajectories."

**Panel 3 — With Formulary Tier Details:**
- Placeholder: tier migration sankey or stacked bar (mock data)
- "Tier data would show preferred drug adherence rates, formulary compliance by group, and opportunities for therapeutic substitution. This directly informs formulary design recommendations."

---

## View 4: AI Process

Meta page. Built as a dashboard, not a PDF. Demonstrates the process IS the product.

### Tools & Architecture (top section)
Row of cards, one per tool: Claude Code, Next.js 14, Vercel Postgres, Drizzle, shadcn/ui, Recharts. Each card: tool name, one-line rationale, icon. Answers "which tools and why" visually.

### Workflow Methodology (new section)
The real differentiator. Shows the engineering process:
- **Dual-machine architecture:** Mac (planning, design, review) + Framework Desktop (implementation). Git as coordination layer. Writer/reviewer separation.
- **CLAUDE.md as living context:** Project decisions, data findings, schema, API contracts in one file read every session. Coherence across dozens of sessions.
- **TODO.md for task tracking:** Prioritized by day, checked off. Keeps AI focused.
- **Session management:** `/open-session` to orient, `/continue-here` for checkpoints, `/close-session` to log. Context compounds, doesn't degrade.
- **Spec-driven development:** Brainstorm → Discuss → Spec → Implement → Verify. No yolo coding.

Framing: "This isn't a one-shot prompt. This is a workflow that scales to any dataset, any client, any deadline."

### Build Journey (timeline section)
Horizontal stepper: EDA → Architecture → Design → Implementation → Polish. Each node expandable:
- Tool used for that phase
- Key prompt excerpt or prompting strategy
- What worked first try (specific wins)
- What needed iteration (honest failures)
- Iteration count

### Honest Limitations (bottom section)
Bullet points, not defensive. Framed as trade-offs and learnings:
- Context window constraints with 596K rows → solved with server-side aggregation
- Chart aesthetics needed manual CSS tuning → AI generates functional, human polishes beautiful
- Single dataset limits validation of anomaly hypotheses → that's why we ask follow-up questions
- 3.5 day timeline = choices about depth vs. breadth → quality over quantity

---

## Global Patterns

### Sidebar
Fixed left. SPS Health title. 4 nav links with icons. Entity selector at bottom (locked to Pharmacy A). Active page highlighted in teal.

### Loading States
Skeleton shimmers on every chart and KPI card. No blank screens, no spinners.

### Empty/Filtered States
"No data matches current filters" with a prompt to adjust. Not an error — a nudge.

### Hover States
Every chart element highlights on hover with a tooltip (Geist Mono, exact values). Table rows highlight. Filter pills darken. Nothing feels dead.

### Transitions
Charts fade in ~200ms. Filter pills animate in/out. Accordion panels expand smoothly. Nothing jarring, nothing slow.

### Desktop Only
Min width ~1200px. No mobile. Evaluator reviews on a monitor.

### Data Formatting
- Commas in numbers: 596,437
- One-decimal percentages: 10.1%
- Abbreviated chart axes: 50K
- Dates: MMM YYYY on charts, full format in tooltips

---

## Brief Compliance Checklist

| Brief Requirement | Coverage |
|---|---|
| Total claims volume, monthly trends | KPI cards + stacked area hero |
| Adjudication rates | Gauge chart + insight card |
| Net claim counts | KPI card, stacked area layers |
| Drill-down: formulary | Filter + donut |
| Drill-down: group ID | Filter + top 10 groups chart |
| Drill-down: pharmacy state | Filter + horizontal bars |
| Drill-down: mail/retail | Filter + narrative (100% retail) |
| Drill-down: drug name | Filter + top drugs table |
| Drill-down: manufacturer | Filter + top manufacturers chart |
| Drill-down: MONY | Filter + donut |
| Trend identification | Anomaly panels + reference lines + insight cards |
| Narrative layer | Dynamic insight cards, filter-responsive |
| Questions for client | Tabbed section, data-grounded |
| Questions for internal teams | Tabbed section, data-grounded |
| Additional data requests | Tabbed section, data-grounded |
| Extension visual mock-up | 3 placeholder panels with mock charts |
| Extension written explanation | Per-panel narrative |
| AI tools + why | Tools cards |
| Key prompts | Journey timeline nodes |
| Right first try vs. iterated | Per-node detail |
| Limitations | Dedicated section |
| Hosted URL | Vercel deployment |

---

## SOTA Additions (Beyond Brief Requirements)

1. **URL-synced filters** — shareable, bookmarkable filter states (?state=CA&formulary=OPEN)
2. **Chart reference lines** — September ▲ and November ▼ markers on hero chart
3. **Enterprise polish** — skeleton loading, hover states, transitions, pixel-perfect spacing
4. **Multi-entity architecture** — entity selector showing Pharmacy B readiness
5. **Workflow methodology** — documented engineering process, not just "I used AI"
