# TODO — SPS Health Case Study

## Up Next

- [ ] Final Vercel deploy + submit

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
- [x] Spec-check all 4 specs → all READY
- [x] Vercel setup: link repo, create Postgres DB, pull env vars, push schema, seed data
- [x] Implement SPEC-001: API routes (8 files, all smoke-tested against live DB)
- [x] Implement SPEC-002: FilterContext + FilterBar + URL sync + chip pills + comboboxes
- [x] Implement SPEC-003: Executive Overview (KPIs, hero chart, donut, bars, gauge, insight cards, reference lines)
- [x] Verify SPEC-003: PASS (15/15 ACs)
- [x] Implement SPEC-004: Claims Explorer (mini trend, drugs table, days supply, MONY donut, groups, manufacturers, 14 insight templates)
- [x] Verify SPEC-004: PASS (17/17 ACs)
- [x] UX fixes: single-item chart states, "All" options in comboboxes, chart title renames, overview-fallback regression fix
- [x] Write SPEC-005: Anomalies & Recommendations page
- [x] Implement SPEC-005: Anomalies & Recommendations (4 investigation panels, mini charts, follow-up questions, extension mock-ups)
- [x] Write SPEC-006: AI Process page
- [x] Discuss SPEC-006: lock 5 design decisions (pipeline viz, teal gradient, artifact styling, full scroll, amber limitations)
- [x] Implement SPEC-006: AI Process page (pipeline flow, artifact evidence, toolkit, honest limitations — 7 files, 511 lines)
- [x] Verify SPEC-005: PASS (14/14 ACs) + fix rotated chart label clipping
- [x] Verify SPEC-006: PASS (14/14 ACs) — fully static server component, zero stubs
- [x] "Ask the Data" chat sidebar — FAB + Sheet overlay, Haiku streaming, EDA context-stuffed, filter-aware, page-aware suggestions
- [x] Enterprise polish pass (responsive, dynamic titles, annotations, favicon, chat error state, anomaly styling)
- [x] ANTHROPIC_API_KEY in Vercel env vars
- [x] Entity selector in sidebar (locked to Pharmacy A, shows multi-entity pattern)
- [x] Final QA — all views, all filters, all narratives (12/12 pass)
- [x] Brief compliance audit (all 7 deliverable items confirmed)
- [x] Browser testing
