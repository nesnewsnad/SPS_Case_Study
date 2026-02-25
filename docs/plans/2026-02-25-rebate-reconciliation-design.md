# Rebate Reconciliation Automation — Discovery Artifact

**Date**: 2026-02-25
**Type**: Discovery artifact for CFO / VP Finance
**Status**: Draft — to be validated in discovery sessions
**Workstream**: B (Workflow Automation Projects)

---

## Purpose

This document is a pre-discovery concept design for automating rebate reconciliation at SPS Health / LithiaRx. It demonstrates understanding of the problem before the first discovery session, provides a concrete vision to react to, and includes an ROI framework the CFO/VP Finance can populate with actuals.

**What this is NOT**: a final spec. Every assumption is marked `[VERIFY IN DISCOVERY]`. The design adapts to whatever we learn.

---

## 1. Current-State Process Map

Based on industry research and the known dual-adjudication-system reality at SPS.

```
REBATE RECONCILIATION — CURRENT STATE (ASSUMED)

┌─────────────────────────────────────────────────────────────┐
│  CLAIMS ADJUDICATION                                        │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐                       │
│  │  Outsourced   │    │  Homegrown   │   <- Two systems,    │
│  │  Adjudication │    │  Adjudication│     two formats      │
│  └──────┬───────┘    └──────┬───────┘                       │
│         │                   │                                │
│         └────────┬──────────┘                                │
│                  v                                           │
│  ┌──────────────────────────┐                                │
│  │  Claims Data Export      │  <- Manual? Automated?         │
│  │  (probably Excel/CSV)    │    [VERIFY IN DISCOVERY]       │
│  └──────────┬───────────────┘                                │
└─────────────┼───────────────────────────────────────────────┘
              v
┌─────────────────────────────────────────────────────────────┐
│  REBATE SUBMISSION                                          │
│                                                             │
│  1. Aggregate claims by manufacturer + drug + period        │
│  2. Format per manufacturer's submission template           │
│  3. Submit to each manufacturer (portal? email? EDI?)       │
│     [VERIFY IN DISCOVERY]                                   │
│  4. Log what was submitted, when, for how much              │
│                                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ~ 30-90 day lag (manufacturer processing)
                           │
                           v
┌─────────────────────────────────────────────────────────────┐
│  PAYMENT RECEIPT                                            │
│                                                             │
│  Manufacturer sends payment (check, ACH, credit memo)       │
│  Often: lump sum with remittance detail                     │
│  Sometimes: no detail — just a number                       │
│                                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           v
┌─────────────────────────────────────────────────────────────┐
│  RECONCILIATION (THE PAIN ZONE)                             │
│                                                             │
│  Finance team manually:                                     │
│  1. Matches payment amount to submission amount             │
│  2. Identifies discrepancies (short-pays, over-pays,        │
│     missing payments, partial payments)                     │
│  3. Investigates each discrepancy:                          │
│     - Was the claim valid?                                  │
│     - Did the manufacturer reject specific NDCs?            │
│     - Was the submission formatted correctly?               │
│     - Did we submit from the right adjudication system?     │
│  4. Tracks resolution (follow-up emails, disputes)          │
│  5. Produces reconciliation report for client pass-through  │
│                                                             │
│  Tools: Excel, probably email, maybe a shared drive         │
│  Time: [QUANTIFY IN DISCOVERY — hours/cycle]                │
│  Error risk: HIGH — manual matching across thousands        │
│              of line items from two different systems        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Assumptions to Verify in Discovery

- How does claims data get exported from each adjudication system?
- How are rebates submitted to manufacturers — portals, email, EDI?
- What does the payment remittance look like — detailed or lump sum?
- What's the cycle — monthly, quarterly?
- How many manufacturers are they reconciling against?
- What's the timeline for migrating to homegrown-only adjudication?

---

## 2. Pain Point Heat Map

Where errors enter, where time is wasted, where dollars leak.

```
PAIN POINT HEAT MAP — REBATE RECONCILIATION

Risk Level:  [!!!] High   [!!] Medium   [!] Low

PHASE              PAIN POINT                   RISK    WHY IT HURTS
---------------------------------------------------------------------------
Data Export        Two systems, two formats      [!!!]   Different schemas
                                                         mean manual
                                                         normalization
                                                         every cycle

                   Migration-period data gaps    [!!!]   Same claim could
                                                         be in either
                                                         system
---------------------------------------------------------------------------
Submission         Manufacturer-specific         [!!]    Each mfr wants
                   formats                                data their way

                   No submission audit trail     [!!]    "Did we send
                                                         that?"
---------------------------------------------------------------------------
Payment Matching   Lump-sum payments without     [!!!]   Can't tie payment
                   line-item detail                       back to claims

                   Partial payments /            [!!!]   Which claims were
                   short-pays                             denied? Manual
                                                         hunt.

                   Timing mismatches             [!!]    Payment arrives
                                                         in different
                                                         period than
                                                         submission
---------------------------------------------------------------------------
Investigation      No centralized discrepancy    [!!!]   Tribal knowledge,
                   tracker                                lost context

                   Email-based follow-ups        [!!]    Threads get
                                                         buried, no SLA
                                                         tracking
---------------------------------------------------------------------------
Reporting          Manual report assembly        [!!]    Hours of
                                                         copy-paste

                   Client pass-through           [!!!]   Revenue at risk
                   accuracy                               if rebates not
                                                         passed through
                                                         correctly
```

**Narrative for CFO**: 10 pain points across 5 phases. Five are high-risk, clustering around data normalization (dual-system problem) and payment matching (core reconciliation problem). These are where dollars leak and hours burn.

**The dual-system angle**: Migration to homegrown-only will eventually eliminate data export pain, but creates new reconciliation risk during the transition. An automation tool helps both now and after migration.

---

## 3. Proposed Future-State Workflow

AI does the investigation. Humans make the decisions. Every AI output has a confirm/edit/reject control. Nothing executes without human approval.

```
REBATE RECONCILIATION — PROPOSED FUTURE STATE

STEP 1: DATA INGESTION (AUTOMATED)

  Claims data from both systems -> normalized into a single unified format.

  Outsourced System CSV + Homegrown System CSV
                    |
                    v
         Unified Claims Ledger
         (one format, one place, source-tagged so you
          know where each claim came from)

  Post-migration: this step becomes trivial (one source).


STEP 2: SUBMISSION TRACKING (SEMI-AUTOMATED)

  When rebates are submitted to a manufacturer:

  +-------------------------------------------------+
  |  Submission Log                                  |
  |                                                  |
  |  Manufacturer:  Aurobindo Pharma                 |
  |  Period:        Q4 2025                          |
  |  Submitted:     2026-01-15                       |
  |  Amount:        $142,387.00                      |
  |  Line items:    1,247 claims                     |
  |  Status:        Awaiting payment                 |
  |  Expected by:   2026-04-15 (90 days)             |
  +-------------------------------------------------+

  Auto-alert if payment not received by expected date.
  HUMAN: logs submission details after sending
         (until submission itself is automated).


STEP 3: AI-ASSISTED PAYMENT MATCHING

  When payment arrives:

  HUMAN: uploads remittance document (PDF/CSV/Excel)
  AI: extracts structured data using Schema-Guided Reasoning
      (see Section 5 for accuracy architecture)
  HUMAN: confirms extracted data (one-click if all checks pass)
  SYSTEM: auto-matches against open submissions

  Three outcomes:

  MATCH              PARTIAL              NO MATCH
  Payment =          Payment !=           Can't tie to
  submission         submission           any submission
  +/- tolerance      (within range)

  Auto-close         Flag for             Flag for
                     investigation        investigation

  Tolerance threshold: configurable (e.g., +/-$50 or +/-0.5%)
  HUMAN: reviews flagged items only — not every match.


STEP 4: AI-ASSISTED DISCREPANCY MANAGEMENT

  Every flagged discrepancy gets a tracked record:

  +-------------------------------------------------+
  |  Discrepancy #DC-2026-0042                       |
  |                                                  |
  |  Manufacturer:  Amneal Pharmaceuticals           |
  |  Period:        Q3 2025                          |
  |  Submitted:     $92,100.00                       |
  |  Received:      $87,204.00                       |
  |  Variance:      -$4,896.00 (-5.3%)               |
  |  Category:      Short-pay                        |
  |  Status:        Under investigation              |
  |  Assigned to:   [finance team member]            |
  |  Days open:     5                                |
  |  SLA:           30 days                          |
  +-------------------------------------------------+

  AI investigates automatically:
  - Compares submission line items against remittance line items
  - Identifies which specific NDCs account for the variance
  - Cross-references against contract data and formulary changes
  - Checks historical patterns across manufacturers
  - Proposes root cause and recommended action

  HUMAN: reviews AI investigation, approves/edits/rejects.

  Auto-escalation if approaching SLA.
  Discrepancy aging dashboard (how many open, how old).


STEP 5: AI-DRAFTED COMMUNICATIONS

  When follow-up with a manufacturer is needed:

  AI drafts email with:
  - Specific discrepancy details and submission reference
  - Identified NDCs and variance amounts
  - Professional, factual tone
  - Attached supporting documentation

  HUMAN: reviews draft, edits if needed, sends.
  No one writes these from scratch anymore.


STEP 6: REPORTING & AUDIT TRAIL (AUTOMATED)

  Auto-generated outputs:

  - Reconciliation Summary (per manufacturer, per period)
    Submitted vs. received vs. outstanding, discrepancy and recovery rates

  - Client Pass-Through Report
    Rebates received attributable to each pharmacy client,
    ready for client invoicing / credit

  - Aging Report
    Open submissions awaiting payment,
    open discrepancies by age bucket (0-30, 31-60, 61+)

  - Audit Trail
    Every action logged: who, when, what
    Supports SOC2 / external audit requirements
```

---

## 4. Mock Dashboard Screens

Four screens the finance team would use day-to-day.

### Screen 1: Reconciliation Home ("The Cockpit")

What the CFO sees when they open the tool. Everything at a glance.

```
+---------------------------------------------------------------------+
|  REBATE RECONCILIATION                          Q4 2025 |  All  |   |
+---------------------------------------------------------------------+
|                                                                     |
|  +----------+  +----------+  +-----------+  +--------+             |
|  | SUBMITTED|  | RECEIVED |  |OUTSTANDING|  | MATCH  |             |
|  |          |  |          |  |           |  | RATE   |             |
|  | $2.41M   |  | $2.18M   |  | $234K     |  | 90.3%  |             |
|  | +12% QoQ |  | +8% QoQ  |  | from $310K|  | +2.1   |             |
|  +----------+  +----------+  +-----------+  +--------+             |
|                                                                     |
|  SUBMISSIONS BY STATUS              DISCREPANCY AGING               |
|  +-----------------------------+  +----------------------------+    |
|  |                             |  |                            |    |
|  |  74%  Fully matched         |  |  0-30 days  ########  12  |    |
|  |  14%  Partial / under review|  |  31-60 days ####       6  |    |
|  |   8%  Awaiting payment      |  |  61-90 days ##         3  |    |
|  |   4%  Discrepancy open      |  |  90+ days   #          2  |    |
|  |                             |  |  !! 2 past SLA             |    |
|  +-----------------------------+  +----------------------------+    |
|                                                                     |
|  MONTHLY TREND (submitted vs received)                              |
|  +-----------------------------+  TOP OPEN DISCREPANCIES            |
|  |  $K                        |  +----------------------------+    |
|  | 300|              ___      |  | Amneal  -$5,764    Day 5   |    |
|  |    |        _____/         |  | Zydus   -$3,201    Day 18  |    |
|  | 200|  _____/               |  | Apotex  -$8,440    Day 31  |    |
|  |    |_/                     |  | Mylan   +$1,200    Day 42  |    |
|  | 100|  --- Submitted        |  | Teva     MISSING   Day 67  |    |
|  |    |  ___ Received         |  +----------------------------+    |
|  |   0| J  F  M  Q2  Q3  Q4  |                                    |
|  +-----------------------------+  INSIGHTS (AI-generated)           |
|                                   +----------------------------+    |
|                                   | CROSS-MANUFACTURER PATTERN |    |
|                                   | 3 manufacturers rejected   |    |
|                                   | same 14 NDCs this quarter. |    |
|                                   | Removing from future subs  |    |
|                                   | prevents ~$12K/qtr in      |    |
|                                   | recurring discrepancies.   |    |
|                                   | [View affected NDCs]       |    |
|                                   |                            |    |
|                                   | PAYMENT TIMING TREND       |    |
|                                   | Avg days-to-pay increased  |    |
|                                   | 47 -> 58 days over 3 qtrs. |    |
|                                   | Aurobindo (+18d) and       |    |
|                                   | Apotex (+14d) driving.     |    |
|                                   | [Adjust payment windows]   |    |
|                                   +----------------------------+    |
+---------------------------------------------------------------------+
```

### Screen 2: Manufacturer Drill-Down

Click any manufacturer from the home screen.

```
+---------------------------------------------------------------------+
|  <- Back    AMNEAL PHARMACEUTICALS                     2025         |
+---------------------------------------------------------------------+
|                                                                     |
|  +-----------+  +-----------+  +-----------+  +-----------+         |
|  |YTD        |  |YTD        |  | RECOVERY  |  | AVG DAYS  |         |
|  |SUBMITTED  |  |RECEIVED   |  | RATE      |  | TO PAY    |         |
|  | $348,204  |  | $331,440  |  | 95.2%     |  | 47 days   |         |
|  +-----------+  +-----------+  +-----------+  +-----------+         |
|                                                                     |
|  SUBMISSION HISTORY                                                 |
|  +------+----------+---------+----------+--------+--------+        |
|  |Period|Submitted |Submit $ |Received  |Recv $  |Status  |        |
|  |      |Date      |         |Date      |        |        |        |
|  +------+----------+---------+----------+--------+--------+        |
|  |Q4 '25|2026-01-15|$87,204  | --       | --     | 41d    |        |
|  |Q3 '25|2025-10-12|$92,100  |2026-01-08|$87,204 | !! -5K |        |
|  |Q2 '25|2025-07-14|$84,500  |2025-09-28|$84,500 | OK     |        |
|  |Q1 '25|2025-04-11|$84,400  |2025-06-22|$84,400 | OK     |        |
|  +------+----------+---------+----------+--------+--------+        |
|                                                                     |
|  OPEN DISCREPANCY — Q3 2025                                        |
|  +-----------------------------------------------------------------+|
|  |  #DC-2026-0042                                                  ||
|  |                                                                  ||
|  |  Submitted: $92,100  |  Received: $87,204  |  Var: -$4,896      ||
|  |                                                                  ||
|  |  AI INVESTIGATION                                               ||
|  |  +-------------------------------------------------------------+||
|  |  | PROBABLE CAUSE (High confidence):                            |||
|  |  |                                                              |||
|  |  | 14 NDCs totaling $4,840 in submission but NOT in remittance. |||
|  |  | These NDCs:                                                  |||
|  |  | - All MONY=O (multi-source generic)                          |||
|  |  | - Switched from contracted -> non-contracted in Amneal's     |||
|  |  |   Q3 2025 formulary update                                   |||
|  |  | - Same 14 NDCs also rejected by Zydus (DC-2026-0038)         |||
|  |  |                                                              |||
|  |  | Remaining $56 variance within rounding tolerance.            |||
|  |  |                                                              |||
|  |  | RECOMMENDED ACTION:                                          |||
|  |  | 1. Verify contract status change with Amneal rep             |||
|  |  | 2. Remove 14 NDCs from future Amneal submissions             |||
|  |  | 3. Check other manufacturers (cross-mfr pattern detected)    |||
|  |  |                                                              |||
|  |  | SIMILAR PAST DISCREPANCIES:                                  |||
|  |  | - DC-2025-0019 (Amneal Q1): same pattern, 8 NDCs, resolved  |||
|  |  | - DC-2025-0031 (Teva Q2): similar, 6 NDCs                   |||
|  |  +-------------------------------------------------------------+||
|  |                                                                  ||
|  |  TIMELINE                                                       ||
|  |  |- 2026-01-08  Payment received ($87,204)                      ||
|  |  |- 2026-01-09  Auto-flagged: variance exceeds tolerance        ||
|  |  |- 2026-01-12  Assigned to Sarah M.                            ||
|  |  |- 2026-01-15  Sarah: "Requesting rejection detail report"     ||
|  |  |- 2026-01-22  Rejection report received — 14 non-contracted   ||
|  |  |- 2026-02-01  Pending: verify NDCs against current contract   ||
|  |  |                                                               ||
|  |  [Add Note]  [Upload Doc]  [Draft Email]  [Resolve]  [Escalate]||
|  +-----------------------------------------------------------------+|
|                                                                     |
|  PAYMENT PATTERN                                                    |
|  +--------------------------------------------------------------+  |
|  | Avg days to pay: 47 (industry avg: 52)                        |  |
|  | Short-pay frequency: 1 of 4 quarters (25%)                    |  |
|  | Typical variance when short: -5.3%                             |  |
|  | Trend: Stable                                                  |  |
|  +--------------------------------------------------------------+  |
+---------------------------------------------------------------------+
```

### Screen 3: AI-Assisted Payment Matching Workspace

Where the finance team processes incoming payments.

```
+---------------------------------------------------------------------+
|  MATCH PAYMENT                                                      |
+---------------------------------------------------------------------+
|                                                                     |
|  +--------------------------------------------------------------+  |
|  |                                                                |  |
|  |     Drop remittance file here (PDF, CSV, or Excel)            |  |
|  |                                                                |  |
|  |     [file] aurobindo-Q4-remit.pdf                             |  |
|  |                                                                |  |
|  +--------------------------------------------------------------+  |
|                                                                     |
|  AI EXTRACTED (review and confirm):                                 |
|  +--------------------------------------------------------------+  |
|  |                                                    Validation |  |
|  |  Manufacturer:  Aurobindo Pharma                   [OK]       |  |
|  |    source: "Header: Aurobindo Pharma Ltd"                     |  |
|  |                                                                |  |
|  |  Amount:        $142,387.00                        [OK]       |  |
|  |    source: "Summary: Total Payment $142,387.00"               |  |
|  |                                                                |  |
|  |  Date:          2026-02-20                         [OK]       |  |
|  |    source: "Footer: Payment Date 02/20/2026"                  |  |
|  |                                                                |  |
|  |  Reference:     ACH-8840291                        [OK]       |  |
|  |    source: "Footer: Ref ACH-8840291"                          |  |
|  |                                                                |  |
|  |  Period:        Q4 2025                            [OK]       |  |
|  |    source: "Header: October - December 2025"                  |  |
|  |                                                                |  |
|  |  Line items:    1,247 found                                   |  |
|  |  +--------+--------------+--------+---------+                |  |
|  |  | NDC    | Drug         | Claims | Rebate  |                |  |
|  |  +--------+--------------+--------+---------+                |  |
|  |  |...01205| Atorvast 40mg|    412 | $4,120  |                |  |
|  |  |...07701| Pantopraz 40 |    387 | $2,709  |                |  |
|  |  | ...    |              |        |         |                |  |
|  |  |  TOTAL |              |  1,247 |$142,387 |                |  |
|  |  +--------+--------------+--------+---------+                |  |
|  |                                                                |  |
|  |  Checksum: line items sum = $142,387.00 = payment    [OK]     |  |
|  |  Duplicate check: reference not in system            [OK]     |  |
|  |  Confidence: 97%                                              |  |
|  |  !! 3 line items could not be parsed (flagged below)          |  |
|  |                                                                |  |
|  +--------------------------------------------------------------+  |
|                                                                     |
|  SUGGESTED MATCHES                                  Tolerance: +/-1%|
|  +--------------------------------------------------------------+  |
|  |                                                                |  |
|  |  [STRONG MATCH] (99.7%)                                       |  |
|  |  +----------------------------------------------------------+ |  |
|  |  | Submission #SUB-2025-Q4-AUR                               | |  |
|  |  | Period: Q4 2025  |  Submitted: 2026-01-10                 | |  |
|  |  | Amount: $142,800.00                                       | |  |
|  |  | Variance: -$413.00 (-0.3%) -- within tolerance             | |  |
|  |  |                                                           | |  |
|  |  | [Accept Match]  [Investigate]                              | |  |
|  |  +----------------------------------------------------------+ |  |
|  |                                                                |  |
|  |  [No match -- create new discrepancy record]                  |  |
|  +--------------------------------------------------------------+  |
+---------------------------------------------------------------------+
```

### Screen 4: Client Pass-Through Report

Auto-generated output for pharmacy clients.

```
+---------------------------------------------------------------------+
|  CLIENT PASS-THROUGH REPORT                                         |
|  Period: Q4 2025                            [Export PDF]  [CSV]     |
+---------------------------------------------------------------------+
|                                                                     |
|  CLIENT: Pharmacy A                    Generated: 2026-02-25        |
|                                                                     |
|  SUMMARY                                                            |
|  +--------------------------------------------------------------+  |
|  |  Total rebates received on your claims:     $48,204.00        |  |
|  |  Less: admin fee (negotiated):              -$2,410.20        |  |
|  |  Net pass-through:                          $45,793.80        |  |
|  |                                                                |  |
|  |  Pending (awaiting manufacturer payment):   $12,400.00        |  |
|  |  In dispute:                                 $1,204.00        |  |
|  +--------------------------------------------------------------+  |
|                                                                     |
|  BREAKDOWN BY MANUFACTURER                                          |
|  +----------------+--------+---------+----------+-----------+      |
|  | Manufacturer    | Claims | Rebate  | Status   | Pass-thru |      |
|  +----------------+--------+---------+----------+-----------+      |
|  | Aurobindo       | 1,247  | $18,400 | Received | $17,480   |      |
|  | Amneal          |   982  | $14,204 | Received | $13,494   |      |
|  | Ascend          |   871  | $12,400 | Pending  | --        |      |
|  | Apotex          |   644  |  $8,200 | Received |  $7,790   |      |
|  | Zydus           |   412  |  $7,400 | !! -$1.2K|  $7,030   |      |
|  +----------------+--------+---------+----------+-----------+      |
|                                                                     |
|  NOTES                                                              |
|  - Zydus Q4: $1,204 short-pay under investigation (DC-2026-0038)  |
|  - Ascend Q4: payment expected by 2026-03-15                       |
|                                                                     |
|  AUDIT TRAIL                                                        |
|  Report generated by: Reconciliation System                         |
|  Data sources: LithiaRx Adjudication (homegrown), payment ledger   |
|  Reconciliation status: 4/5 manufacturers matched                   |
+---------------------------------------------------------------------+
```

---

## 5. Accuracy Architecture: Schema-Guided Extraction + Deterministic Validation

The design principle: **the AI is never the last line of defense.** It's the first line of offense — it does the reading. Deterministic rules verify the output. The human is the judge. Over time, the system earns trust through tracked accuracy.

### Why This Matters

Raw AI extraction on documents is ~95-97% field-level accurate. That's not good enough for finance. But you don't need the AI to be perfect — you need the **system** to be perfect. That's a solvable problem through three layers.

### Layer 1: Schema-Guided Extraction (AI does the reading)

Instead of "here's a PDF, what's in it?" the AI follows the exact schema of what the finance person looks for, in the order they look for it, with the rules they apply. This is the Schema-Guided Reasoning framework: Role, Context, Task, Format, Constraints.

```
SCHEMA: REMITTANCE DOCUMENT EXTRACTION

Role:
  You are a pharmacy rebate reconciliation specialist at an LTC
  pharmacy benefit administrator. You extract structured data from
  manufacturer remittance documents.

Context:
  - This is a single remittance document from one manufacturer
    for one submission period
  - Remittance formats vary by manufacturer but always contain:
    payment amount, period covered, and usually line-item detail
  - Known manufacturers: [list from system]

Task:
  Extract the following fields from this document. For each field,
  provide the extracted value AND the exact text/location where
  you found it (quote the source).

Format:
  {
    "manufacturer": {
      "value": "Aurobindo Pharma",
      "source": "Header, line 1: 'Aurobindo Pharma Ltd - Rebate Remittance'"
    },
    "payment_amount": {
      "value": 142387.00,
      "source": "Summary section: 'Total Payment: $142,387.00'"
    },
    "period": {
      "value": "Q4 2025",
      "source": "Header: 'Period: October - December 2025'"
    },
    "payment_date": {
      "value": "2026-02-20",
      "source": "Footer: 'Payment Date: 02/20/2026'"
    },
    "reference_number": {
      "value": "ACH-8840291",
      "source": "Footer: 'Ref: ACH-8840291'"
    },
    "line_items": [
      {
        "ndc": "65862001205",
        "drug_name": "Atorvastatin 40mg",
        "claims_count": 412,
        "rebate_amount": 4120.00,
        "source": "Line item table, row 1"
      }
    ],
    "line_item_total": {
      "value": 142387.00,
      "source": "Computed: sum of line_items[].rebate_amount"
    },
    "confidence": "high",
    "warnings": []
  }

Constraints:
  - If a field cannot be found, set value to null and explain in
    source what you looked for and why it wasn't found
  - If a value is ambiguous, set confidence to "low" and explain
  - NEVER guess or infer amounts — extract exactly what's printed
  - The line_item_total must be independently computed by summing
    line items — do NOT copy the printed total
  - Flag if computed total != printed total (catches PDF errors)
```

**Key**: every extracted value carries its source quote. The human can glance at the source to verify without re-reading the entire document. The AI is forced to show its work.

### Layer 2: Deterministic Validation (code does the math)

After AI extracts, a rule engine (no AI — pure logic) runs validation checks:

```
VALIDATION RULES (deterministic, not AI)

CHECK 1: Manufacturer name match
  Extracted manufacturer must fuzzy-match a known manufacturer
  in the system (Levenshtein distance <= 2, or exact on aliases)
  FAIL: flag for human review, suggest closest match

CHECK 2: Amount is a valid number
  payment_amount must be > 0 and < $10M (sanity bound)
  FAIL: reject extraction, require human entry

CHECK 3: Line items sum to total
  sum(line_items[].rebate_amount) must equal line_item_total
  Tolerance: +/-$0.99 (rounding)
  FAIL: flag discrepancy, show both numbers

CHECK 4: Line item total vs. payment amount
  line_item_total should equal payment_amount
  If not: this IS the discrepancy — flag, don't fail

CHECK 5: Period is valid
  period must parse to a recognized quarter/month
  period must be within 18 months of current date (sanity)
  FAIL: flag for human review

CHECK 6: NDC format
  each line_item NDC must be 11 digits
  each NDC should match a known NDC in claims data
  FAIL: flag unknown NDCs (could be new or misread)

CHECK 7: Duplicate detection
  reference_number must not already exist in the system
  FAIL: "This payment may already be recorded"

CHECK 8: Cross-reference against open submissions
  manufacturer + period should match an open submission
  If no match: flag "no matching submission found"
```

**This is the trust layer.** The AI reads. The rules verify. If any check fails, the human sees exactly what failed and why. The system never silently passes through bad data.

### Layer 3: Progressive Trust Calibration (learning over time)

The system tracks its own accuracy and earns trust through evidence.

```
TRUST BUILDING PROTOCOL

PHASE 1: "Prove it" (first 2-3 cycles)
  - AI extracts, validation runs, human reviews EVERY field
  - System tracks: how often does the human change an AI value?
  - Expected: <5% correction rate on well-formatted docs

PHASE 2: "Trust but verify" (cycles 4-6)
  - Fields that have never been corrected -> auto-confirmed
    with green checkmarks
  - Fields that have been corrected -> highlighted for review
  - Human focuses only on flagged items

PHASE 3: "Exception only" (cycle 7+)
  - All-green extractions -> one-click confirm
  - Human reviews only validation failures and low-confidence
    extractions
  - System has a track record: "247 extractions, 3 corrections
    (98.8% accuracy)"

ACCURACY TRACKER (visible in the tool):

  Total documents processed:     247
  Fields extracted:              1,976
  Human corrections:             3 (0.15%)
  Validation catches:            12 (0.6%)
  Undetected errors:             0

  BY MANUFACTURER:
  Aurobindo:  62 docs, 0 corrections    -> trusted
  Amneal:     58 docs, 1 correction     -> trusted
  Zydus:      44 docs, 0 corrections    -> trusted
  Apotex:     41 docs, 2 corrections    -> review
  (Apotex uses a non-standard PDF format)

  BY FIELD:
  manufacturer:    0 corrections        -> trusted
  payment_amount:  0 corrections        -> trusted
  period:          1 correction         -> trusted
  line_items:      2 corrections        -> review
```

### How the Three Layers Work Together

```
Layer               What it catches                     AI or Code?
-------------------------------------------------------------------
Schema-guided       Nothing missed, source citations    AI
extraction          force show-your-work

Deterministic       Math errors, format errors,         Code
validation          duplicates, impossible values

Progressive trust   Tracks accuracy over time,          Code
calibration         focuses human attention where
                    it matters, builds evidence
```

The AI is never the last line of defense. It's the first line of offense.

---

## 6. AI Capabilities Summary

Four targeted AI capabilities, each with human approval gates.

### Capability 1: Remittance Document Parsing
- **Trigger**: User uploads PDF/CSV/Excel
- **AI does**: Extracts structured fields using Schema-Guided Reasoning
- **Human does**: Reviews extracted data with source citations, confirms or corrects
- **Trust mechanism**: Deterministic validation + progressive accuracy tracking

### Capability 2: Discrepancy Investigation
- **Trigger**: Payment matching flags a variance exceeding tolerance
- **AI does**: Compares line items, identifies missing NDCs, cross-references contracts and historical patterns, proposes root cause
- **Human does**: Reviews investigation, approves recommended action
- **Trust mechanism**: Investigation cites specific data sources; human can verify each claim

### Capability 3: Communication Drafting
- **Trigger**: User clicks "Draft Email" on a discrepancy
- **AI does**: Generates professional follow-up email with specific amounts, NDCs, submission references
- **Human does**: Reviews draft, edits if needed, sends
- **Trust mechanism**: Email is never sent automatically; human always reviews

### Capability 4: Pattern Detection & Insights
- **Trigger**: Runs after each reconciliation cycle
- **AI does**: Analyzes full history for cross-manufacturer patterns, payment timing trends, recovery opportunities
- **Human does**: Reviews insights, decides whether to act
- **Trust mechanism**: Insights are suggestions with supporting data, not actions

---

## 7. ROI Projection Template

Present to CFO/VP Finance: "I've filled in industry benchmarks — can you fill in your actuals so we can size this together?"

```
SECTION A: CURRENT STATE (fill in actuals)

  Cycle frequency:                [Quarterly]    -> 4 cycles/year
  Manufacturers per cycle:        [___]          Benchmark: 15-30
  Hours per cycle (total team):   [___]          Benchmark: 40-80 hrs
  Staff involved:                 [___]          Benchmark: 2-3 people
  Fully-loaded hourly cost:       [___]          Benchmark: $45-65/hr
  Discrepancies per cycle:        [___]          Benchmark: 8-15%
  % resolved within 30 days:      [___]          Benchmark: 60-70%
  Avg $ per unresolved dispute:   [___]          Benchmark: $2K-8K
  Total annual rebate volume:     [___]          (for sizing)


SECTION B: PROJECTED SAVINGS

                            CURRENT      PROJECTED      SAVINGS
  TIME
  Hours per cycle:          [80]    ->   [20-30]    =   50-60 hrs
  Cycles per year:          x4           x4
  Annual hours:             320 hrs ->   80-120 hrs =   200-240 hrs
  Annual labor cost:        $17,600 ->   $4,400-6,600   $11K-13K

  ERRORS
  Match rate (auto):        0%      ->   85-90%
  Manual reviews needed:    100%    ->   10-15%     =   85-90% fewer
  Discrepancy catch time:   Days    ->   Same-day

  REVENUE RECOVERY
  Unresolved disputes:      [4/yr]  ->   [1/yr]     =   3 fewer
  Avg dispute value:        [$5K]   ->               =   $15K saved
  Faster follow-up:         67 days ->   30 days avg

  COMPLIANCE
  Audit readiness:          Manual  ->   Auto trail  =   Unquantified
  SOC2 evidence:            Scramble ->  On-demand       but real


SECTION C: TOTAL ESTIMATED ANNUAL VALUE

  Labor savings:                            $11,000 - $13,200
  Revenue recovery (fewer lost disputes):   $10,000 - $15,000
  Audit prep reduction:                      $3,000 -  $5,000
                                            -----------------
  ESTIMATED ANNUAL VALUE:                   $24,000 - $33,200

  Implementation cost:   ~$0 (intern labor + free/existing tooling)
  Payback period:        Immediate


SECTION D: NON-FINANCIAL BENEFITS

  - Survives the adjudication system migration
    (Step 1 normalizes from any source — swap inputs, not the tool)

  - Institutional knowledge captured
    (Discrepancy resolutions are logged, not in someone's head)

  - Client transparency
    (Auto-generated pass-through reports build trust)

  - Scales without headcount
    (Add manufacturers or clients without adding staff hours)

  - Maintainable after internship ends
    (No-code/low-code — your team owns it, no developer needed)
```

**How to use in the room**: Don't present as "here's how much you'll save." Present as "here's a framework — I've filled in industry benchmarks, but I need your numbers to make it real." This makes them a collaborator, not an audience.

---

## 8. Tool Candidates

Decision depends on what SPS already uses. Verify in discovery.

```
IF Microsoft 365 (likely given Azure stack):
  - Power Automate: workflow triggers, email alerts, approval flows
  - Power BI: dashboards and reports
  - Power Automate AI Builder: document parsing
  - SharePoint Lists: submission/discrepancy tracking
  - Cost: $0 additional (included in M365 licensing)

IF standalone / best-of-breed:
  - Airtable: database + automations + forms ($20/user/mo)
  - Claude API via webhook: document parsing + investigation + drafting
  - Zapier: cross-tool automations ($20/mo)
  - Cost: ~$60-80/mo total

IF Plenful (existing partner):
  - May already cover some/all of this
  - Verify scope in discovery before building anything that overlaps
  - Cost: already contracted
```

---

## 9. Discovery Session Questions

Use this research to ask informed questions, not start from zero.

### For Finance (CFO / VP Finance / Controller)

1. "How do you currently reconcile manufacturer rebate payments against submitted claims? What tools do you use?"
2. "How many hours per cycle does reconciliation take? What's the error rate?"
3. "What does a typical remittance document look like — detailed line items or lump sum?"
4. "How many manufacturers do you reconcile against per cycle?"
5. "What's the most time-consuming part — the matching, the investigation, or the reporting?"
6. "Have you ever missed revenue because a discrepancy aged out or was forgotten?"

### For PBM Services (VP Klumb)

1. "Is Plenful currently automating any part of rebate reconciliation? What's in scope vs. out of scope?"
2. "How does the outsourced vs. homegrown adjudication split affect rebate submissions?"
3. "What's the timeline for moving to homegrown-only?"

---

## 10. What This Document Communicates

When the CFO/VP Finance sees this artifact:

1. **"This person understands our business."** The process map mirrors their reality. The pain points are real. The dual-system angle shows awareness of their specific situation.

2. **"This is concrete, not hand-wavy."** Mock screens show exactly what they'd use. The ROI template gives them a framework. This isn't a slide deck — it's a blueprint.

3. **"The AI is controlled, not scary."** Every AI capability has a human approval gate. The accuracy architecture shows how trust is earned through evidence, not promises. Nothing runs unsupervised.

4. **"This survives after the intern leaves."** No-code/low-code, documented, maintainable by non-technical staff. Built on tools they already have or can easily adopt.

5. **"Let's size this together."** The ROI template invites collaboration. They fill in actuals, they own the business case. It's their project, not the intern's.
