# Framework Prompt: Narrative Enrichment + Recommendation Block

> **For Claude:** Execute the narrative enrichment plan at `docs/plans/2026-02-21-narrative-enrichment-plan.md` (Tasks 1-8), then execute Task 9 below. Task 9 is NEW — it's not in the plan file. All 9 tasks should be committed and pushed when done.

---

## Context

The narrative enrichment design and plan are already in the repo:

- Design: `docs/plans/2026-02-21-narrative-enrichment-design.md`
- Plan: `docs/plans/2026-02-21-narrative-enrichment-plan.md`

Execute Tasks 1-8 from the plan exactly as written. Then execute Task 9 below.

**Mac review feedback on the plan**: The narrative upgrades are all strong. The COVID framing is credible, the semi-synthetic caveats are maintained throughout, and the rfpImpact rewrites are significantly better. One gap: the synthesis block summarizes what was found but never tells the client what to _do_. The anomalies page needs a recommendation — a verdict on Pharmacy A. That's Task 9.

---

## Task 9: Add Recommendation Block to Anomalies Page

**Goal**: Add a three-tier recommendation section between the Investigation Panels and the Follow-Up Questions on the anomalies page. This is the "so what" — it tells SPS Health what the findings mean for Pharmacy A as a client.

**Files:**

- Modify: `src/app/anomalies/page.tsx`

**Step 1: Add recommendation section between panels and follow-up questions**

In `src/app/anomalies/page.tsx`, find this boundary (around line 168-175):

```tsx
      </section>

      {/* Section 2: Follow-Up Questions */}
      <section className="space-y-4 border-t pt-6">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Follow-Up &amp; Next Steps
        </h2>
```

Insert a new section between `</section>` and `{/* Section 2 */}`:

```tsx
      </section>

      {/* Section: Recommendation */}
      <section className="space-y-4 border-t pt-6">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Recommendation
        </h2>
        <Card className="border-l-4 border-l-teal-400 shadow-sm">
          <CardContent className="space-y-5 pt-6">
            {/* Green */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  &#10003;
                </span>
                <h3 className="text-sm font-semibold">Sound Fundamentals — No Action Needed</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground pl-8">
                Pharmacy A&apos;s drug mix is 84% generic (MONY Y) — strong cost discipline for LTC.
                Reversal rates are uniform at ~10% across all five states and all formulary types — no
                outlier groups, no systematic billing issues. Dispensing patterns (7-14 day cycles,
                1st-of-month fills) are textbook LTC operations. These are the fundamentals of a clean
                book of business.
              </p>
            </div>

            {/* Yellow */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                  ?
                </span>
                <h3 className="text-sm font-semibold">Needs a Conversation — Not a Concern</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground pl-8">
                The Kansas batch reversal is traceable and clean (reverse → rebill → resume), but the
                root cause matters for ongoing claims management: was it a pricing correction, a plan
                migration, or an audit recoupment? September and November volume swings of +41% / -54%
                — whether COVID-driven or seasonal — affect rate-setting and should be modeled into
                projections. These aren&apos;t red flags. They&apos;re the right questions to ask before
                contract finalization.
              </p>
            </div>

            {/* Red */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                  !
                </span>
                <h3 className="text-sm font-semibold">Analytical Boundary — Requires Production Data</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground pl-8">
                Formulary-tier optimization — the highest-value PBM lever — cannot be validated with
                this dataset. Categorical flags (formulary, adjudication) appear randomized across all
                dimensions, meaning any formulary strategy recommendation would be unreliable. This is
                the most important next step: production data with real adjudication outcomes unlocks the
                analysis that moves Pharmacy A from &quot;clean book&quot; to &quot;optimized book.&quot;
              </p>
            </div>

            {/* Closer */}
            <div className="rounded-r border-l-4 border-teal-300 bg-teal-50/50 px-5 py-3.5">
              <p className="text-sm font-medium leading-relaxed text-teal-900">
                Pharmacy A&apos;s fundamentals don&apos;t raise concerns — they raise opportunities. The
                data supports onboarding; the next dataset unlocks optimization.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 2: Follow-Up Questions */}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/app/anomalies/page.tsx
git commit -m "feat: add three-tier recommendation block to anomalies page

Green (sound fundamentals), yellow (needs conversation), red (analytical
boundary) — frames Pharmacy A as a clean book of business with one
actionable next step: production data for formulary optimization.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Execution Order

1. Tasks 1-8 from `docs/plans/2026-02-21-narrative-enrichment-plan.md` (execute exactly as written)
2. Task 9 above (recommendation block)
3. Final build + typecheck + lint verification
4. Push all commits

## Commit Strategy

Follow the commit strategy in the plan: separate commits for the synthesis block (Task 1), API route narrative changes (Tasks 2-6 together), follow-up question updates (Task 7), and the recommendation block (Task 9). Task 8 is verification only.
