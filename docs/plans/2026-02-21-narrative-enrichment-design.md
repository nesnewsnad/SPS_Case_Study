# Design: Narrative Enrichment — Business Impact + COVID Context

**Created**: 2026-02-21
**Scope**: Enrich anomaly panel narratives in `src/app/api/anomalies/route.ts` + follow-up questions in `src/components/anomalies/follow-up-questions.tsx` + synthesis block on anomalies page
**Approach**: Hypothesis framing — present COVID/business context as plausible real-world explanations, acknowledge semi-synthetic data caveat
**No new UI components** — text-only changes to existing string literals + one new synthesis paragraph element

---

## 1. Synthesis Block (NEW)

Add a 2-3 sentence synthesis paragraph at the top of the Investigation Panels section on the Anomalies page (`src/app/anomalies/page.tsx`), before Panel 1.

**Text**:

> Four anomalies and two structural patterns emerged from 596,000 claims rows. One was a planted test that any analytics vendor should catch. One was a traceable batch event affecting 18 Kansas groups. Two align with the realities of LTC pharmacy in 2021 — a Delta-wave recovery surge in September and a staffing-crisis contraction in November. Underneath the anomalies, Pharmacy A's fundamentals are sound: a heavily generic drug mix, uniform ~10% reversal rates across all states, and textbook LTC dispensing cycles. The dataset does flag one analytical boundary — categorical flags (formulary, adjudication) appear randomized, meaning formulary-tier optimization requires production data to validate. Everything else here is actionable today.

**Styling**: Same muted text style as the page subtitle. Sits between the "INVESTIGATION PANELS" section header and the first panel.

---

## 2. Panel 1: Kryptonite XR (lines 91-98)

### `whyItMatters` (replace)

**Current**: "This is almost certainly a test/dummy drug injected into the dataset. If not identified, it inflates May volume by ~20x and skews monthly trends, reversal rates, and drug mix analysis."

**New**: "This is a deliberate test injection — a fictional drug with a fictional manufacturer whose statistical fingerprint perfectly mirrors the real data's distributions. If not caught, it inflates May volume by ~20x, artificially raises brand (MONY N) share from 13.6% to 20.8%, and makes monthly trend analysis unreliable. For a PBM evaluating vendor analytics capability, this is a litmus test: any platform that reports May as a legitimate peak month or inflated brand share has failed basic data integrity validation."

### `rfpImpact` (replace)

**Current**: "Demonstrates data quality detection capability. Any analytics vendor that reports May as a real peak month has failed a basic data integrity check."

**New**: "This finding is the first thing an evaluator will look for. It tests whether a vendor blindly charts data or interrogates it. We identified the injection, quantified its distortion across five dimensions (volume, brand mix, reversal rate, drug count, monthly trend), and built a toggle to show the data both ways — because the right answer isn't just 'exclude it,' it's 'show what changes when you do.'"

---

## 3. Panel 2: Kansas August Batch Reversal (lines 412-419)

### `whyItMatters` (replace)

**Current**: "This is a classic batch reversal and rebill pattern — July claims were reversed in August and re-submitted in September. Kansas's elevated annual reversal rate (15.8%) is entirely an artifact of this single August event. Excluding August, KS has a normal ~10% reversal rate."

**New**: "This is a classic batch reversal and rebill pattern — July claims reversed in August, re-submitted in September. In 2021, PBMs were actively auditing COVID-era claims and not honoring pandemic waivers, triggering bulk reversals and rebilling across managed care plans. The 18 affected groups all share a '400xxx' prefix consistent with a single MCO or plan sponsor — suggesting a contract-level event (pricing correction, plan migration, or audit recoupment) rather than individual pharmacy errors. Without this decomposition, Kansas appears to have a 15.8% annual reversal rate — 50% worse than peer states. The real rate is ~10%, indistinguishable from every other state."

### `toConfirm` (replace)

**Current**: "Was there a known system migration, billing correction, or contract renegotiation affecting these 18 Kansas groups in August 2021?"

**New**: "Was there a KanCare MCO contract change, PBM audit, or MAC pricing correction affecting these 18 '400xxx' groups in August 2021? The rebill pattern is consistent with a plan-level event — confirming the cause determines whether this is a one-time correction or a recurring risk."

### `rfpImpact` (replace)

**Current**: "Proper identification of batch reversal events prevents mischaracterizing an entire state's claims performance."

**New**: "A naive analysis would flag Kansas as a high-reversal outlier and recommend operational intervention. The correct analysis identifies a one-time batch event, normalizes the data, and asks the right follow-up: what triggered the rebill? The difference is between a false alarm and actionable intelligence."

---

## 4. Panel 3: September Volume Spike (lines 272-278)

### `whyItMatters` (replace)

**Current**: "A uniform spike across all dimensions suggests a systemic cause — not a single group, drug, or state driving the increase. The KS batch rebill (re-incurring ~2,700 claims) partially explains the spike, but ~23,000 excess claims remain unexplained."

**New**: (uses dynamic `septStateMin`/`septStateMax` variables already in scope)

"September 2021 was the peak of the Delta variant surge — over 100,000 COVID hospitalizations and 172,000 daily cases nationally. Nursing home cases surged from 319/week in late June to 2,700+/week by August. In a real LTC pharmacy portfolio, a September spike is consistent with multiple converging factors: catch-up claims processing after the Delta summer disruption, the start of COVID booster campaigns for LTC residents (September 20), Q3-end Medicare reconciliation, and the Kansas rebill groups re-incurring ~2,700 claims. However, the perfect uniformity of the spike (all states +${septStateMin}-${septStateMax}%) is atypical of real operational disruptions, which tend to vary by geography — consistent with the semi-synthetic data characteristics noted in Panel 6."

### `toConfirm` (replace)

**Current**: "Was there a Q3-end processing catch-up, LTC facility re-enrollment cycle, or known system event in September 2021?"

**New**: "Was September volume affected by Delta-wave catch-up processing, the booster rollout (Sep 20), or Q3-end Medicare reconciliation? Separating operational volume changes from claims-processing timing is critical for accurate forecasting."

### `rfpImpact` (replace)

**Current**: "Highlights the need for seasonal normalization in trend analysis and capacity planning."

**New**: "This finding demonstrates the difference between reporting a number and interpreting it. A +${septPct}% spike has multiple plausible explanations — pandemic recovery, fiscal-year processing, batch rebills — and the correct response is to enumerate them, quantify what each explains, and flag the residual. That's the analytical depth a PBM client is paying for."

---

## 5. Panel 4: November Volume Dip (lines 317-330)

### `whyItMatters` (replace — note: this is inside an IIFE that computes novStateMin/novStateMax)

**Current**: "The dip is perfectly uniform across all states (X-Y% below normal) and all groups. This rules out a single facility closure or regional event as the cause."

**New**: (keep the dynamic range computation, replace the return string)

"November 2021 was a perfect storm for LTC operations. The Great Resignation peaked nationally with 4.5 million workers quitting — nursing homes had lost 234,000 employees (15% of their workforce) by this point. CMS published its vaccine mandate on November 5, requiring all nursing home staff to receive at least one dose by December 5, creating administrative chaos and fears of further workforce exodus. Omicron was reported to the WHO on November 24, triggering anticipatory facility lockdowns. The dip is uniform across all states (${novStateMin}-${novStateMax}% below normal), which could reflect either a real industry-wide contraction or the semi-synthetic data scaling noted in Panel 6. In real-world data, we would expect some geographic variation driven by state-level vaccine mandate responses."

### `toConfirm` (replace)

**Current**: "Was there a known reduction in LTC admissions, a data extract issue, or a processing delay affecting November 2021?"

**New**: "Was the November dip driven by the CMS vaccine mandate (Nov 5), the Great Resignation's peak impact on LTC staffing, anticipatory Omicron lockdowns, or a data extract timing issue? The answer determines whether this is a recurring seasonal risk or a one-time artifact."

### `rfpImpact` (replace)

**Current**: "Understanding this dip is critical for accurate year-over-year comparisons and forecasting."

**New**: "A 54% volume dip isn't just a data curiosity — it's a capacity planning input, a staffing model variable, and a revenue forecasting risk. Knowing whether this is operational (and likely to recur during future disruptions) or a data artifact determines whether the client needs to build contingency into their models."

---

## 6. Panel 5: Cycle Fill (lines 502-508) — minor enrichment

### `whyItMatters` (replace)

**Current**: "Identifying dispensing cycles enables capacity planning, staffing optimization, and predictive ordering. The day-26 secondary peak suggests at least two distinct facility dispensing schedules within the network."

**New**: "In LTC pharmacy, dispensing cycles drive everything — staffing schedules, inventory ordering, delivery logistics, and claims processing capacity. The day-1 primary peak is consistent with standard 28-30 day cycle fills for skilled nursing facilities. The day-26 secondary peak suggests a second cohort of facilities (possibly ALF or different SNF operators) on an offset schedule. During COVID, disrupted staffing made these peak days even more operationally critical — a facility short-staffed on day 1 could delay hundreds of fills."

---

## 7. Panel 6: Semi-Synthetic (lines 549-553) — minor enrichment

### `rfpImpact` (replace)

**Current**: "Demonstrates deep data integrity analysis — catching that the data 'looks real but isn't quite' shows a level of scrutiny that goes beyond surface-level dashboarding."

**New**: "This is arguably the most important finding for interpretation: it establishes the boundaries of what this data can and cannot tell us. Utilization patterns (which drugs, which groups, which states, when) are real and analytically valuable. But formulary strategy conclusions, adjudication rate optimization, and state-level regulatory analysis should be flagged as unreliable until confirmed against production data. Knowing what you can't conclude is as valuable as knowing what you can."

---

## 8. Follow-Up Questions (src/components/anomalies/follow-up-questions.tsx)

### Client Question 3 context (September)

**Current**: "The spike is perfectly uniform across all states (40-42% increase) and formulary types — suggesting a systemic cause rather than a single group or drug."

**Append**: " September 2021 coincided with the Delta variant peak and the start of COVID booster campaigns for LTC residents."

### Client Question 4 context (November)

**Current**: "All 30 days are present and all 183 active groups are present. The volume reduction is uniform across every dimension."

**Append**: " November 2021 saw the CMS vaccine mandate publication (Nov 5), peak Great Resignation impact on healthcare, and the emergence of the Omicron variant (Nov 24)."

---

## Files Changed

1. `src/app/api/anomalies/route.ts` — 12 string literal replacements (whyItMatters, toConfirm, rfpImpact across 6 panels)
2. `src/app/anomalies/page.tsx` — 1 new synthesis paragraph element
3. `src/components/anomalies/follow-up-questions.tsx` — 2 context string appends

## No Structural Changes

- No new components
- No new API fields
- No database changes
- No new dependencies
