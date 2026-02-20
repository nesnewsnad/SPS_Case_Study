# TODO — SPS Health Case Study

## Up Next

- [ ] `/discuss` — lock specs for Executive Overview + Claims Explorer (first build scope)
- [ ] Vercel setup: link repo, create Postgres DB, pull env vars, push schema, seed data
- [ ] Write SPEC-001: FilterContext + API filter contract
- [ ] Write SPEC-002: Executive Overview (KPIs, hero chart, secondary charts, insight cards)
- [ ] Write SPEC-003: Claims Explorer (table, distributions, mini trend)

## Friday (Core Dashboard)

- [ ] FilterContext + URL-synced filter state
- [ ] API route: /api/overview (KPIs, monthly aggregates, adjudication rates)
- [ ] API route: /api/claims (filtered aggregations, top drugs, groups, manufacturers)
- [ ] Executive Overview view (KPI cards, stacked area hero, donut, bars, gauge)
- [ ] Reference lines on hero chart (Sept spike, Nov dip)
- [ ] Claims Explorer view (filter bar, top drugs table, days supply, MONY donut)
- [ ] Top 10 Groups + Top 10 Manufacturers charts on Explorer
- [ ] Dynamic insight cards (filter-responsive, consultant-analyst tone)
- [ ] Cross-filtering: click any chart element → updates all charts + KPIs

## Saturday (Deep Dive & Narrative)

- [ ] API route: /api/anomalies (pre-computed breakdowns per anomaly)
- [ ] Anomalies page: 3 investigation panels (Sept spike, Nov dip, KS reversals)
- [ ] Mini charts within each investigation panel
- [ ] Follow-up questions (3 tabs: client, internal, data requests)
- [ ] Extension mock-up (3 placeholder panels: pricing, demographics, formulary tiers)
- [ ] Narrative polish — insight cards on all views, 100% retail callout
- [ ] Loading skeletons + empty/filtered-out states

## Sunday (AI Process & Polish)

- [ ] AI Process: tools & architecture cards
- [ ] AI Process: workflow methodology section (dual-machine, CLAUDE.md, session mgmt)
- [ ] AI Process: build journey timeline (expandable phases)
- [ ] AI Process: honest limitations section
- [ ] Enterprise polish pass (colors, spacing, typography, hover states, transitions)
- [ ] Sticky filter bar + chip pills across all views
- [ ] Entity selector in sidebar (locked to Pharmacy A, shows multi-entity pattern)

## Monday (Ship)

- [ ] Final QA — all views, all filters, all narratives
- [ ] Brief compliance audit (every bullet covered)
- [ ] Browser testing (Chrome, Safari, Firefox)
- [ ] Final Vercel deploy
- [ ] Write submission email/message
- [ ] Submit

## Done

- [x] Scaffold Next.js 14 + Tailwind + TypeScript
- [x] Set up Drizzle ORM + database schema (entities, claims, drug_info)
- [x] Install and configure shadcn/ui
- [x] Write seed script (CSV → Postgres)
- [x] Create basic app shell (sidebar nav, 4 view placeholders)
- [x] Push to remote (github.com/nesnewsnad/SPS_Case_Study)
- [x] Brainstorm design — 12 decisions locked, SOTA validated, design doc written
