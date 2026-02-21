# Narrative Enrichment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enrich anomaly panel narratives with COVID-19 context, business impact, and a synthesis block — transforming findings into actionable analysis.

**Architecture:** Text-only changes to 3 files. No new components, no DB changes, no new dependencies. All edits are string literal replacements in the anomalies API route, a new paragraph element on the anomalies page, and two context string appends in the follow-up questions component.

**Tech Stack:** Next.js (existing), TypeScript string literals

---

### Task 1: Add synthesis block to Anomalies page

**Files:**

- Modify: `src/app/anomalies/page.tsx:161-168`

**Step 1: Add synthesis paragraph between section header and panels**

In `src/app/anomalies/page.tsx`, find the Investigation Panels section (line 161-168):

```tsx
      <section className="space-y-4">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Investigation Panels
        </h2>
        {data.panels.map((panel) => (
```

Replace with:

```tsx
      <section className="space-y-4">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Investigation Panels
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Four anomalies and two structural patterns emerged from 596,000 claims rows. One was a
          planted test that any analytics vendor should catch. One was a traceable batch event
          affecting 18 Kansas groups. Two align with the realities of LTC pharmacy in 2021 — a
          Delta-wave recovery surge in September and a staffing-crisis contraction in November.
          Underneath the anomalies, Pharmacy A&apos;s fundamentals are sound: a heavily generic drug
          mix, uniform ~10% reversal rates across all states, and textbook LTC dispensing cycles. The
          dataset does flag one analytical boundary — categorical flags (formulary, adjudication)
          appear randomized, meaning formulary-tier optimization requires production data to validate.
          Everything else here is actionable today.
        </p>
        {data.panels.map((panel) => (
```

**Step 2: Verify build**

Run: `cd /home/danswensen/SPS_Case_Study && npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/anomalies/page.tsx
git commit -m "feat: add synthesis block to anomalies page

Adds executive summary paragraph above investigation panels that
ties all findings together — Kryptonite test, KS batch event,
Delta-wave September spike, November staffing contraction — and
frames Pharmacy A's fundamentals as sound with one analytical caveat.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Enrich Panel 1 (Kryptonite XR) narratives

**Files:**

- Modify: `src/app/api/anomalies/route.ts:93-98`

**Step 1: Replace `whyItMatters` string (line 93-94)**

Find:

```typescript
      whyItMatters:
        'This is almost certainly a test/dummy drug injected into the dataset. If not identified, it inflates May volume by ~20x and skews monthly trends, reversal rates, and drug mix analysis.',
```

Replace with:

```typescript
      whyItMatters:
        "This is a deliberate test injection — a fictional drug with a fictional manufacturer whose statistical fingerprint perfectly mirrors the real data's distributions. If not caught, it inflates May volume by ~20x, artificially raises brand (MONY N) share from 13.6% to 20.8%, and makes monthly trend analysis unreliable. For a PBM evaluating vendor analytics capability, this is a litmus test: any platform that reports May as a legitimate peak month or inflated brand share has failed basic data integrity validation.",
```

**Step 2: Replace `rfpImpact` string (line 97-98)**

Find:

```typescript
      rfpImpact:
        'Demonstrates data quality detection capability. Any analytics vendor that reports May as a real peak month has failed a basic data integrity check.',
```

Replace with:

```typescript
      rfpImpact:
        "This finding is the first thing an evaluator will look for. It tests whether a vendor blindly charts data or interrogates it. We identified the injection, quantified its distortion across five dimensions (volume, brand mix, reversal rate, drug count, monthly trend), and built a toggle to show the data both ways — because the right answer isn't just 'exclude it,' it's 'show what changes when you do.'",
```

**Step 3: Verify build**

Run: `cd /home/danswensen/SPS_Case_Study && npx tsc --noEmit`
Expected: No errors

---

### Task 3: Enrich Panel 2 (Kansas August) narratives

**Files:**

- Modify: `src/app/api/anomalies/route.ts:414-419`

**Step 1: Replace `whyItMatters` string (line 414-415)**

Find:

```typescript
      whyItMatters:
        "This is a classic batch reversal and rebill pattern — July claims were reversed in August and re-submitted in September. Kansas's elevated annual reversal rate (15.8%) is entirely an artifact of this single August event. Excluding August, KS has a normal ~10% reversal rate.",
```

Replace with:

```typescript
      whyItMatters:
        "This is a classic batch reversal and rebill pattern — July claims reversed in August, re-submitted in September. In 2021, PBMs were actively auditing COVID-era claims and not honoring pandemic waivers, triggering bulk reversals and rebilling across managed care plans. The 18 affected groups all share a '400xxx' prefix consistent with a single MCO or plan sponsor — suggesting a contract-level event (pricing correction, plan migration, or audit recoupment) rather than individual pharmacy errors. Without this decomposition, Kansas appears to have a 15.8% annual reversal rate — 50% worse than peer states. The real rate is ~10%, indistinguishable from every other state.",
```

**Step 2: Replace `toConfirm` string (line 416-417)**

Find:

```typescript
      toConfirm:
        'Was there a known system migration, billing correction, or contract renegotiation affecting these 18 Kansas groups in August 2021?',
```

Replace with:

```typescript
      toConfirm:
        "Was there a KanCare MCO contract change, PBM audit, or MAC pricing correction affecting these 18 '400xxx' groups in August 2021? The rebill pattern is consistent with a plan-level event — confirming the cause determines whether this is a one-time correction or a recurring risk.",
```

**Step 3: Replace `rfpImpact` string (line 418-419)**

Find:

```typescript
      rfpImpact:
        "Proper identification of batch reversal events prevents mischaracterizing an entire state's claims performance.",
```

Replace with:

```typescript
      rfpImpact:
        "A naive analysis would flag Kansas as a high-reversal outlier and recommend operational intervention. The correct analysis identifies a one-time batch event, normalizes the data, and asks the right follow-up: what triggered the rebill? The difference is between a false alarm and actionable intelligence.",
```

---

### Task 4: Enrich Panel 3 (September Spike) narratives

**Files:**

- Modify: `src/app/api/anomalies/route.ts:273-278`

**Step 1: Replace `whyItMatters` string (line 273-274)**

Find:

```typescript
      whyItMatters:
        'A uniform spike across all dimensions suggests a systemic cause — not a single group, drug, or state driving the increase. The KS batch rebill (re-incurring ~2,700 claims) partially explains the spike, but ~23,000 excess claims remain unexplained.',
```

Replace with:

```typescript
      whyItMatters: `September 2021 was the peak of the Delta variant surge — over 100,000 COVID hospitalizations and 172,000 daily cases nationally. Nursing home cases surged from 319/week in late June to 2,700+/week by August. In a real LTC pharmacy portfolio, a September spike is consistent with multiple converging factors: catch-up claims processing after the Delta summer disruption, the start of COVID booster campaigns for LTC residents (September 20), Q3-end Medicare reconciliation, and the Kansas rebill groups re-incurring ~2,700 claims. However, the perfect uniformity of the spike (all states +${septStateMin}-${septStateMax}%) is atypical of real operational disruptions, which tend to vary by geography — consistent with the semi-synthetic data characteristics noted in Panel 6.`,
```

**Step 2: Replace `toConfirm` string (line 275-276)**

Find:

```typescript
      toConfirm:
        'Was there a Q3-end processing catch-up, LTC facility re-enrollment cycle, or known system event in September 2021?',
```

Replace with:

```typescript
      toConfirm:
        'Was September volume affected by Delta-wave catch-up processing, the booster rollout (Sep 20), or Q3-end Medicare reconciliation? Separating operational volume changes from claims-processing timing is critical for accurate forecasting.',
```

**Step 3: Replace `rfpImpact` string (line 277-278)**

Find:

```typescript
      rfpImpact:
        'Highlights the need for seasonal normalization in trend analysis and capacity planning.',
```

Replace with:

```typescript
      rfpImpact: `This finding demonstrates the difference between reporting a number and interpreting it. A +${septPct}% spike has multiple plausible explanations — pandemic recovery, fiscal-year processing, batch rebills — and the correct response is to enumerate them, quantify what each explains, and flag the residual. That's the analytical depth a PBM client is paying for.`,
```

---

### Task 5: Enrich Panel 4 (November Dip) narratives

**Files:**

- Modify: `src/app/api/anomalies/route.ts:318-330`

**Step 1: Replace the `whyItMatters` IIFE return string (line 318-326)**

The `whyItMatters` field uses an IIFE that computes `novStateMin`/`novStateMax`. Find the entire IIFE block:

```typescript
      whyItMatters: (() => {
        const novStateRanges = (novByState.rows as Record<string, unknown>[]).map((r) => {
          const avg = stateAvgMap.get(String(r.state)) ?? 1;
          return Math.round(Math.abs(((Number(r.november) - avg) / avg) * 100));
        });
        const novStateMin = Math.min(...novStateRanges);
        const novStateMax = Math.max(...novStateRanges);
        return `The dip is perfectly uniform across all states (${novStateMin}-${novStateMax}% below normal) and all groups. This rules out a single facility closure or regional event as the cause.`;
      })(),
```

Replace with:

```typescript
      whyItMatters: (() => {
        const novStateRanges = (novByState.rows as Record<string, unknown>[]).map((r) => {
          const avg = stateAvgMap.get(String(r.state)) ?? 1;
          return Math.round(Math.abs(((Number(r.november) - avg) / avg) * 100));
        });
        const novStateMin = Math.min(...novStateRanges);
        const novStateMax = Math.max(...novStateRanges);
        return `November 2021 was a perfect storm for LTC operations. The Great Resignation peaked nationally with 4.5 million workers quitting — nursing homes had lost 234,000 employees (15% of their workforce) by this point. CMS published its vaccine mandate on November 5, requiring all nursing home staff to receive at least one dose by December 5, creating administrative chaos and fears of further workforce exodus. Omicron was reported to the WHO on November 24, triggering anticipatory facility lockdowns. The dip is uniform across all states (${novStateMin}-${novStateMax}% below normal), which could reflect either a real industry-wide contraction or the semi-synthetic data scaling noted in Panel 6. In real-world data, we would expect some geographic variation driven by state-level vaccine mandate responses.`;
      })(),
```

**Step 2: Replace `toConfirm` string (line 327-328)**

Find:

```typescript
      toConfirm:
        'Was there a known reduction in LTC admissions, a data extract issue, or a processing delay affecting November 2021?',
```

Replace with:

```typescript
      toConfirm:
        "Was the November dip driven by the CMS vaccine mandate (Nov 5), the Great Resignation's peak impact on LTC staffing, anticipatory Omicron lockdowns, or a data extract timing issue? The answer determines whether this is a recurring seasonal risk or a one-time artifact.",
```

**Step 3: Replace `rfpImpact` string (line 329-330)**

Find:

```typescript
      rfpImpact:
        'Understanding this dip is critical for accurate year-over-year comparisons and forecasting.',
```

Replace with:

```typescript
      rfpImpact:
        "A 54% volume dip isn't just a data curiosity — it's a capacity planning input, a staffing model variable, and a revenue forecasting risk. Knowing whether this is operational (and likely to recur during future disruptions) or a data artifact determines whether the client needs to build contingency into their models.",
```

---

### Task 6: Enrich Panels 5-6 (Cycle Fill, Semi-Synthetic) narratives

**Files:**

- Modify: `src/app/api/anomalies/route.ts:503-504, 552-553`

**Step 1: Replace Panel 5 `whyItMatters` string (line 503-504)**

Find:

```typescript
      whyItMatters:
        'Identifying dispensing cycles enables capacity planning, staffing optimization, and predictive ordering. The day-26 secondary peak suggests at least two distinct facility dispensing schedules within the network.',
```

Replace with:

```typescript
      whyItMatters:
        'In LTC pharmacy, dispensing cycles drive everything — staffing schedules, inventory ordering, delivery logistics, and claims processing capacity. The day-1 primary peak is consistent with standard 28-30 day cycle fills for skilled nursing facilities. The day-26 secondary peak suggests a second cohort of facilities (possibly ALF or different SNF operators) on an offset schedule. During COVID, disrupted staffing made these peak days even more operationally critical — a facility short-staffed on day 1 could delay hundreds of fills.',
```

**Step 2: Replace Panel 6 `rfpImpact` string (line 552-553)**

Find:

```typescript
      rfpImpact:
        "Demonstrates deep data integrity analysis — catching that the data 'looks real but isn't quite' shows a level of scrutiny that goes beyond surface-level dashboarding.",
```

Replace with:

```typescript
      rfpImpact:
        "This is arguably the most important finding for interpretation: it establishes the boundaries of what this data can and cannot tell us. Utilization patterns (which drugs, which groups, which states, when) are real and analytically valuable. But formulary strategy conclusions, adjudication rate optimization, and state-level regulatory analysis should be flagged as unreliable until confirmed against production data. Knowing what you can't conclude is as valuable as knowing what you can.",
```

**Step 3: Verify build**

Run: `cd /home/danswensen/SPS_Case_Study && npm run build`
Expected: Build succeeds

**Step 4: Commit all API route changes (Tasks 2-6)**

```bash
git add src/app/api/anomalies/route.ts
git commit -m "feat: enrich anomaly narratives with COVID context and business impact

- Kryptonite: quantify brand mix distortion, frame as vendor litmus test
- KS August: add PBM COVID-audit context, MCO contract hypothesis
- September: Delta wave peak, booster rollout, Q3 reconciliation
- November: Great Resignation, CMS vaccine mandate, Omicron emergence
- Cycle Fill: LTC operational context, COVID staffing impact
- Semi-Synthetic: frame as analytical boundary, not limitation

All narratives use hypothesis framing — present COVID as plausible
real-world context while acknowledging semi-synthetic data caveat.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 7: Enrich follow-up questions with COVID context

**Files:**

- Modify: `src/components/anomalies/follow-up-questions.tsx:20-21, 25-26`

**Step 1: Update Client Question 3 context (September, line 20-21)**

Find:

```typescript
    context:
      'The spike is perfectly uniform across all states (40-42% increase) and formulary types — suggesting a systemic cause rather than a single group or drug.',
```

Replace with:

```typescript
    context:
      'The spike is perfectly uniform across all states (40-42% increase) and formulary types — suggesting a systemic cause rather than a single group or drug. September 2021 coincided with the Delta variant peak and the start of COVID booster campaigns for LTC residents.',
```

**Step 2: Update Client Question 4 context (November, line 25-26)**

Find:

```typescript
    context:
      'All 30 days are present and all 183 active groups are present. The volume reduction is uniform across every dimension.',
```

Replace with:

```typescript
    context:
      'All 30 days are present and all 183 active groups are present. The volume reduction is uniform across every dimension. November 2021 saw the CMS vaccine mandate publication (Nov 5), peak Great Resignation impact on healthcare, and the emergence of the Omicron variant (Nov 24).',
```

**Step 3: Verify build**

Run: `cd /home/danswensen/SPS_Case_Study && npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/anomalies/follow-up-questions.tsx
git commit -m "feat: add COVID context to September and November follow-up questions

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 8: Final verification

**Step 1: Full build**

Run: `cd /home/danswensen/SPS_Case_Study && npm run build`
Expected: Build succeeds with no errors

**Step 2: Type check**

Run: `cd /home/danswensen/SPS_Case_Study && npx tsc --noEmit`
Expected: No type errors

**Step 3: Lint**

Run: `cd /home/danswensen/SPS_Case_Study && npm run lint`
Expected: No new warnings or errors
