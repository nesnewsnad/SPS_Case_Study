# SPS Health — AI Implementation Intern Case Study

## What This Is
An interactive, web-based dashboard analyzing a year of pharmacy claims data from a prospective long-term care pharmacy client (Pharmacy A) for SPS Health's RFP evaluation. The dashboard tells the story of this client's 2021 utilization patterns and demonstrates AI-driven analytical capability.

## Dual Machine Architecture
- **Mac**: architecture, planning, design docs, session logs, prioritizes TODO, writes specs, reviews
- **Framework Desktop**: implementation, builds dashboard, tests, commits
- **Git**: coordination layer between the two machines
- **Rule**: writer/reviewer separation — whoever wrote the code doesn't verify it

## Deliverables
1. **Interactive Dashboard** — web-based, pseudo-Power BI, self-contained HTML
2. **Follow-Up Questions & Next Steps** — embedded in dashboard
3. **Dashboard Extension Mock-Up** — placeholder panels with narrative
4. **AI Process Documentation** — methodology, prompts, iterations

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

## Tech Stack
- **Dashboard**: Single self-contained HTML file
- **Charting**: Chart.js (interactive, lightweight, no build step)
- **Data**: Embedded JSON (pre-processed from CSV)
- **Styling**: Inline CSS, responsive layout
- **No server required**: opens in any browser

## Artifact Chain
```
Case Study PDF (immutable intent — the "PDR")
  └→ CLAUDE.md (this file — project context & architecture)
       └→ Session Logs (docs/sessions/YYYY-MM-DD.md)
            └→ TODO.md (live task queue)
                 └→ Discuss (gray areas → CONTEXT doc)
                      └→ Research (investigate before spec)
                           └→ Specs (docs/specs/SPEC-NNN-*.md)
                                └→ Implementation
                                     └→ Verify (goal-backward)
```

## Context Management
- One spec per session
- Use `/continue-here` when context degrades or switching tasks
- Use `/close-session` at end of every work period
- Start every session with `/open-session`
