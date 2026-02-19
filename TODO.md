# TODO — SPS Health Case Study

Ownership: Mac writes specs and prioritizes. Framework implements and checks off.

## Up Next

- [ ] **Discuss: Dashboard Architecture** — Run `/discuss` to lock design decisions (layout, chart types, interaction patterns, narrative structure, color palette) before writing any specs
- [ ] **Research: Dashboard Patterns** — Investigate best-in-class pharmacy/claims dashboards, Chart.js capabilities for required interactions, LTC industry KPIs
- [ ] **SPEC-001: Data Pipeline & Embedding** — Pre-process CSVs into embedded JSON, handle BOM, merge on NDC, compute derived fields (month, reversal flag, MONY labels)
- [ ] **SPEC-002: Dashboard Layout & Navigation** — Overall structure, tabs/sections, responsive grid, header/KPI cards, tab switching
- [ ] **SPEC-003: Utilization Summary View** — Total claims, monthly trend line, adjudication rates, net claim counts, KPI cards with sparklines
- [ ] **SPEC-004: Drill-Down & Filtering** — Filter bar (formulary, state, group, MONY, manufacturer, drug), cross-filtering behavior, reset, active filter display
- [ ] **SPEC-005: Trend & Anomaly Identification** — September spike callout, November dip, KS reversal anomaly, top drugs by volume, seasonal patterns
- [ ] **SPEC-006: Narrative Layer** — Commentary annotations on charts, insight cards, "what this means" sections, storytelling flow
- [ ] **SPEC-007: Follow-Up Questions & Next Steps** — Client questions, internal team questions, additional data requests section
- [ ] **SPEC-008: Dashboard Extension Mock-Up** — Placeholder panels for pricing, demographics, formulary tiers, reimbursement; written explanation of each
- [ ] **SPEC-009: AI Process Documentation** — Tool choices, key prompts, iteration log, limitations section
- [ ] **Final: Integration & Polish** — Cross-section consistency, load testing, browser compatibility, final narrative review

## Done

(none yet)

## Later

- [ ] Deploy to hosted URL (Netlify/Vercel) for submission link
- [ ] Screen recording of AI process (optional deliverable)
