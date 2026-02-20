# TODO — SPS Health Case Study

## Up Next

- [x] Write SPEC-002: FilterContext + FilterBar + URL sync
- [x] Write SPEC-003: Executive Overview page
- [x] Write SPEC-004: Claims Explorer page
- [x] Vercel setup: link repo, create Postgres DB, pull env vars, push schema, seed data
- [x] Fix SPEC-003 spec-check notes (Mac) → READY
- [x] Fix SPEC-004 spec-check notes (Mac) → READY

## Friday (Core Dashboard)

- [ ] Install missing shadcn components: `npx shadcn@latest add command popover switch skeleton`
- [x] Implement SPEC-001: API routes + shared types (parse-filters, build-where, 6 endpoints) — Mac to verify
  - [ ] Include `labelName` in drugs API response (brief lists LABEL_NAME in data dictionary — surface in drug table tooltip)
- [ ] Implement SPEC-002: FilterContext + FilterBar + URL sync + chip pills
  - [ ] Add disabled "Retail (100%)" chip in FilterBar — brief lists mail/retail as a drill-down dimension, this shows we noticed
- [ ] Implement SPEC-003: Executive Overview (KPIs, hero chart, donut, bars, gauge, insight cards)
- [ ] Implement SPEC-004: Claims Explorer (mini trend, drugs table, days supply, MONY, groups, manufacturers)
- [ ] Cross-filtering: click any chart element → updates all charts + KPIs
- [ ] Reference lines on hero chart (Sept spike, Nov dip)

## Saturday (Deep Dive & Narrative)

- [x] API route: /api/anomalies (pre-computed breakdowns per anomaly) — included in SPEC-001
- [ ] Anomalies page: 4 investigation panels (Kryptonite XR, Sept spike, Nov dip, KS Aug batch reversal)
- [ ] Mini charts within each investigation panel
- [ ] Follow-up questions (3 tabs: client, internal, data requests)
- [ ] Extension mock-up panels with written narrative per panel (brief says "both" — visual AND written):
  - [ ] MOCK: Client onboarding + comparison — CSV upload flow → auto-ingest → side-by-side KPIs, overlay trends, benchmark reversal rates. Written narrative explains multi-entity architecture already in place.
  - [ ] MOCK: Pricing & reimbursement overlay — how cost data would layer onto utilization
  - [ ] MOCK: Patient demographics — age/gender stratification, what it unlocks for LTC analysis
  - [ ] MOCK: Automated anomaly detection — statistical engine that flags outliers on ingestion
- [ ] Narrative polish — insight cards on all views, 100% retail callout
- [ ] Loading skeletons + empty/filtered-out states

## Sunday (AI Process & Polish)

- [ ] "Ask the Data" chat sidebar — slide-out Sheet, Anthropic API (Haiku), context-stuffed with EDA findings + schema, streamed via Vercel AI SDK `useChat()`. 2-3 hrs.
  - [ ] `/api/chat` route — system prompt with key data findings, schema, Pharmacy A context
  - [ ] Chat UI — shadcn Sheet + input + message list
  - [ ] ANTHROPIC_API_KEY in Vercel env vars
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
- [x] Spec-check SPEC-003 → READY (7 fixes applied)
- [x] Spec-check SPEC-004 → READY (7 fixes applied)
- [x] Vercel setup: link repo, create Postgres DB, pull env vars, push schema, seed data (246,955 drugs, 596,090 claims)
- [x] Fix seed script: BOM handling for Drug_Info.csv, batch size reduction, FK removal for 30 unmatched NDCs, truncate with identity reset
- [x] Implement SPEC-001: 8 files — api-types, parse-filters, build-where, 6 API routes (entities, filters, overview, claims, anomalies). All smoke-tested against live DB, EDA oracle values match.
