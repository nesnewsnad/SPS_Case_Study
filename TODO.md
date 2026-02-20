# TODO — SPS Health Case Study

## Up Next

- [ ] Vercel setup: link repo, create Postgres DB, pull env vars, push schema, seed data (Framework)
- [ ] Fix SPEC-003 spec-check notes (Mac)
- [ ] Fix SPEC-004 spec-check notes (Mac)

## Friday (Core Dashboard)

- [ ] Install missing shadcn components: `npx shadcn@latest add command popover switch skeleton`
- [ ] Implement SPEC-001: API routes + shared types (parse-filters, build-where, 6 endpoints)
- [ ] Implement SPEC-002: FilterContext + FilterBar + URL sync + chip pills
- [ ] Implement SPEC-003: Executive Overview (KPIs, hero chart, donut, bars, gauge, insight cards)
- [ ] Implement SPEC-004: Claims Explorer (mini trend, drugs table, days supply, MONY, groups, manufacturers)
- [ ] Cross-filtering: click any chart element → updates all charts + KPIs
- [ ] Reference lines on hero chart (Sept spike, Nov dip)

## Saturday (Deep Dive & Narrative)

- [ ] API route: /api/anomalies (pre-computed breakdowns per anomaly)
- [ ] Anomalies page: 4 investigation panels (Kryptonite XR, Sept spike, Nov dip, KS Aug batch reversal)
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
- [x] `/discuss` — 6 gray areas locked, horizontal slice architecture (DISCUSS-001)
- [x] Write SPEC-001: API routes + shared TypeScript types (6 endpoints, unified filters)
- [x] Write SPEC-002: FilterContext + FilterBar + URL sync
- [x] Write SPEC-003: Executive Overview page
- [x] Write SPEC-004: Claims Explorer page
- [x] Fresh EDA — verified all data findings, discovered Kryptonite XR test drug + KS Aug batch reversal
- [x] Amend all 4 specs for flagged NDC toggle + corrected anomaly narratives
- [x] 69 pytests codifying EDA findings as data contracts
- [x] Spec-check SPEC-001 → READY (16 ACs, 2 implementor notes)
- [x] Spec-check SPEC-002 → READY (20 ACs, prerequisites documented)
- [x] Spec-check SPEC-003 → READY WITH NOTES (needs minor fixes)
- [x] Spec-check SPEC-004 → READY WITH NOTES (needs minor fixes)
