# Verification: SPEC-005 — Anomalies & Recommendations Page

**Verifier**: Mac (reviewer session)
**Implementation**: Framework (commit `0c75cc3`)
**Date**: 2026-02-20
**Method**: Code review (6 files) + Playwright browser test against `sps-case-study.vercel.app/anomalies`

---

## Goal Statement

The Anomalies & Recommendations page must render three sections from a single API call: (1) four anomaly investigation panels with charts and structured narratives, (2) a tabbed follow-up questions section, and (3) four dashboard extension mock-ups with visual elements and written narratives. No filtering. Skeleton loading. Error retry.

---

## AC Verification

| AC  | Description                                                                      | Exists | Substantive | Wired | Verdict  | Evidence                                                                                                                                                                                                                                                                                                                                                                                          |
| --- | -------------------------------------------------------------------------------- | ------ | ----------- | ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Page fetches `/api/anomalies?entityId=1`, renders 3 sections                     | Yes    | Yes         | Yes   | **PASS** | `page.tsx:95` fetches endpoint; lines 160-170 render panels, FollowUpQuestions, ExtensionMockups. Playwright confirms all 3 sections visible.                                                                                                                                                                                                                                                     |
| 2   | No FilterBar on this page                                                        | Yes    | Yes         | N/A   | **PASS** | No FilterBar import or usage in any anomalies file. Confirmed visually — no filter controls.                                                                                                                                                                                                                                                                                                      |
| 3   | 4 panels with title, key stat badge, severity badge                              | Yes    | Yes         | Yes   | **PASS** | `anomaly-panel.tsx` renders keyStat pill (line 48), title (line 52), severity Badge (line 53). SEVERITY_MAP covers all 4 panel IDs. Playwright: 4× "What We See", all 4 panel titles found. Screenshots confirm amber/red color coding.                                                                                                                                                           |
| 4   | Each panel has 4 narrative sections                                              | Yes    | Yes         | Yes   | **PASS** | `anomaly-panel.tsx:58-115` renders What We See, Why It Matters, To Confirm (amber left-border quote style), RFP Impact (italic teal). Playwright: 4× each section label. Screenshots confirm distinct styling per section.                                                                                                                                                                        |
| 5   | Mini charts render dynamically by type                                           | Yes    | Yes         | Yes   | **PASS** | `anomaly-mini-chart.tsx` uses `detectKeys()` for dynamic key detection, supports bar/grouped-bar/stacked-bar. Color logic: teal for volume, amber for rates, green/red/blue for Jul/Aug/Sep. Charts visible in screenshots: Kryptonite monthly bar, Sept by state grouped-bar, Sept by formulary stacked-bar, Nov by state grouped-bar, KS reversal rate bar, KS batch groups grouped-bar.        |
| 6   | Kryptonite before/after table                                                    | Yes    | Yes         | Yes   | **PASS** | `before-after-table.tsx` uses shadcn Table. Red tint on "With Kryptonite" column, teal tint on "Without Kryptonite". Conditional render: `{panel.beforeAfter && <BeforeAfterTable>}`. Playwright: 1× "With Kryptonite" header. Screenshot shows 5-row comparison table with correct colors.                                                                                                       |
| 7   | 3 tabs using shadcn Tabs                                                         | Yes    | Yes         | Yes   | **PASS** | `follow-up-questions.tsx` imports shadcn Tabs/TabsList/TabsTrigger/TabsContent. Playwright: tabs found = `['Client Questions', 'Internal Team', 'Data Requests']`. Tab clicks verified — content changes on click.                                                                                                                                                                                |
| 8   | Each tab has 5 numbered questions with context                                   | Yes    | Yes         | Yes   | **PASS** | CLIENT_QUESTIONS (5), INTERNAL_QUESTIONS (5), DATA_REQUESTS (5) — each with `q` and `context` fields. `QuestionList` renders numbered circles + question + context paragraph. Content matches spec text. Playwright + screenshot confirms numbered list visible.                                                                                                                                  |
| 9   | 4 extension mock-ups in 2×2 grid                                                 | Yes    | Yes         | Yes   | **PASS** | `extension-mockup.tsx:260` uses `grid gap-4 md:grid-cols-2`. MOCKUPS array has 4 entries. Screenshot confirms 2×2 layout with all 4 cards.                                                                                                                                                                                                                                                        |
| 10  | Each mock-up has icon, title, FUTURE badge, visual, narrative, data requirements | Yes    | Yes         | Yes   | **PASS** | `ExtensionMockupCard` renders: Icon (line 219), CardTitle (227), Badge "Future" with `uppercase` class (228), Visual component (234), narrative text (235), "Data Required" header + bullet list (237-243). Playwright: 4× "Future" badges, all 4 titles found.                                                                                                                                   |
| 11  | Visual mockups have real visual elements, not empty boxes                        | Yes    | Yes         | Yes   | **PASS** | 4 dedicated components: `OnboardingMockup` (Pharmacy A/B side-by-side KPI bars), `PricingMockup` (volume bars + cost dots + SVG trend line), `DemographicsMockup` (age/gender pyramid with 6 rows), `AnomalyDetectionMockup` (SVG sparkline + anomaly markers + alert badges). All use dashed border + "Coming Soon" overlay + opacity-40 visual content. Screenshots confirm structured visuals. |
| 12  | Skeleton loading states for all sections                                         | Yes    | Yes         | Yes   | **PASS** | Three skeleton components: `PanelSkeleton` (mimics panel header + content), `QuestionsSkeletion` (mimics tabs + question list), `MockupsSkeleton` (mimics 2×2 grid). Loading state renders 4× PanelSkeleton + questions + mockups skeletons (lines 128-145).                                                                                                                                      |
| 13  | Error state with retry button                                                    | Yes    | Yes         | Yes   | **PASS** | Error branch at lines 115-125: "Failed to load anomaly data" + error detail + `<Button variant="outline" onClick={fetchData}>Retry</Button>`. `fetchData` resets error and re-fetches.                                                                                                                                                                                                            |
| 14  | Scrollable, no horizontal overflow, text readable                                | Yes    | Yes         | Yes   | **PASS** | Page uses `space-y-8 p-6` layout. Charts use `ResponsiveContainer`. Playwright: `scrollWidth <= clientWidth` confirmed (no horizontal overflow). Content scrolls naturally in `<main>` container (4977px total height).                                                                                                                                                                           |

---

## Stub Detection

**Zero stubs found.** Scanned all 6 implementation files for:

- `TODO`, `PLACEHOLDER`, `FIXME`, `HACK`: none
- `console.log`: none (only `console.error` in API route catch block — appropriate)
- Empty function bodies: none
- Hardcoded sample data: none (all panel data comes from API; follow-up questions are intentionally static per spec)
- Commented-out code: none

Minor cosmetic note: `QuestionsSkeletion` has a typo (should be `QuestionsSkeleton`) — internal component name only, zero user impact.

---

## Scope Creep

**Minimal.** Compared against non-goals:

| Non-Goal                      | Status                                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Filtering/cross-filtering     | Not built                                                                                                     |
| Real-time anomaly detection   | Not built (mock-up only)                                                                                      |
| Functional extension features | Not built (mock-ups with narratives)                                                                          |
| Interactive chart exploration | Tooltips present — spec says "acceptable"                                                                     |
| Insight cards                 | Not built (panels ARE the insights)                                                                           |
| AI-generated analysis         | Not built                                                                                                     |
| Dark mode                     | `dark:` utility classes on BeforeAfterTable — progressive enhancement, not a dark mode feature. Non-blocking. |
| Mobile/responsive layout      | Not built (responsive grid is incidental)                                                                     |

---

## Browser Test

**Platform**: Playwright headless Chromium (1440×900 viewport) against `sps-case-study.vercel.app/anomalies`

| Check                                                         | Result                                                         |
| ------------------------------------------------------------- | -------------------------------------------------------------- |
| Page loads without error                                      | PASS — no error state, data renders                            |
| 4 investigation panels visible                                | PASS — all 4 titles + narratives + charts                      |
| Kryptonite bar chart shows May spike                          | PASS — single dominant bar at ~49K                             |
| Before/after table with red/teal columns                      | PASS — 5 comparison rows, correct colors                       |
| September panel: 3 charts (monthly + by state + by formulary) | PASS — all 3 visible                                           |
| November panel: 2 charts (monthly + by state)                 | PASS — both visible                                            |
| KS August panel: reversal rate bar + batch groups grouped-bar | PASS — green/red/blue Jul/Aug/Sep pattern visible              |
| Severity badges: Data Quality, Volume Anomaly ×2, Operational | PASS — correct labels on correct panels                        |
| To Confirm sections: amber left border                        | PASS — distinct quote-style treatment                          |
| RFP Impact sections: italic teal                              | PASS — visible in screenshots                                  |
| 3 tabs functional (click switches content)                    | PASS — Internal Team and Data Requests tabs verified           |
| 5 questions per tab with numbered badges                      | PASS — Client tab has 5 numbered items with context            |
| 4 extension mockups in 2×2 grid                               | PASS — all 4 visible with correct titles                       |
| Mock-up visuals are structured (not empty boxes)              | PASS — pyramid, sparkline, bars, side-by-side KPIs all visible |
| "Coming Soon" overlays on all 4 mockups                       | PASS — 4× "Coming Soon" badges                                 |
| "Future" badges on all 4 mockups                              | PASS — 4× "Future" badges                                      |
| No horizontal overflow                                        | PASS — `scrollWidth <= clientWidth`                            |
| No FilterBar present                                          | PASS — none visible                                            |

---

## Overall: PASS

**14/14 ACs pass at all three verification levels (Exists, Substantive, Wired).** Zero stubs. Minimal scope creep. Browser test confirms all elements render correctly on the live Vercel deployment with proper data, styling, and interactivity.

Implementation quality is high — the extension mockups in particular go well beyond the minimum (structured SVG sparklines, age pyramids, grouped KPI bars) and the narrative styling (amber-bordered "To Confirm", italic teal "RFP Impact") creates clear visual hierarchy across the investigation panels.
