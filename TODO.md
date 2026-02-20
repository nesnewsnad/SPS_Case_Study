# TODO — SPS Health Case Study

## Up Next

- [ ] Write SPEC-005: Anomalies & Recommendations page ← **NOW**
- [ ] Write SPEC-006: AI Process page
- [ ] Implement SPEC-005 (Framework)
- [ ] Implement SPEC-006 (Framework)
- [ ] "Ask the Data" chat sidebar
- [ ] Enterprise polish pass
- [ ] Final QA + submit

## Anomalies & Recommendations (SPEC-005)

- [ ] 4 investigation panels (Kryptonite XR, KS Aug batch reversal, Sept spike, Nov dip)
- [ ] Mini charts within each investigation panel
- [ ] Follow-up questions (3 tabs: client, internal, data requests)
- [ ] Extension mock-up panels with written narrative:
  - [ ] MOCK: Client onboarding + comparison
  - [ ] MOCK: Pricing & reimbursement overlay
  - [ ] MOCK: Patient demographics
  - [ ] MOCK: Automated anomaly detection
- [ ] Insight cards for anomalies view

## AI Process (SPEC-006)

- [ ] Tools & architecture cards
- [ ] Workflow methodology (dual-machine, CLAUDE.md, session mgmt)
- [ ] Build journey timeline (expandable phases)
- [ ] Honest limitations section

## Chat Sidebar

- [ ] `/api/chat` route — system prompt with key data findings, schema, Pharmacy A context
- [ ] Chat UI — shadcn Sheet + input + message list
- [ ] ANTHROPIC_API_KEY in Vercel env vars

## Polish & Ship

- [ ] Enterprise polish pass (colors, spacing, typography, hover states, transitions)
- [ ] Entity selector in sidebar (locked to Pharmacy A, shows multi-entity pattern)
- [ ] Final QA — all views, all filters, all narratives
- [ ] Brief compliance audit (every bullet covered)
- [ ] Browser testing (Chrome, Safari, Firefox)
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
