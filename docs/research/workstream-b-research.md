# Workstream B Research: Workflow Automation Opportunities at SPS Health

**Date**: 2026-02-25
**Purpose**: Pre-internship research to identify likely manual workflows and automation candidates before discovery sessions with department leaders.

---

## 1. SPS Health Company Profile

### What They Are

SPS Health (legal name: Summit Pharmacy Solutions, LLC) is a **PE-backed pharmacy benefit administration and services platform** headquartered in Milwaukee, WI. Founded September 2021, ~75-120 employees, ~$10.6M revenue. Nautic Partners invested in January 2022 (~$50.5M total funding).

**They are NOT a pharmacy.** They provide technology-enabled services to LTC, correctional, and behavioral health pharmacies.

### Subsidiaries

| Entity                           | Focus                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------- |
| **LithiaRx**                     | Formulary management, claims adjudication, rebate submission/auditing         |
| **Trinity Healthcare Solutions** | Consulting: formulary optimization, data analytics, pharmacy network strategy |
| **StatimRx**                     | On-demand pharmacy logistics, 70K+ retail pharmacy network, delivery platform |

### Key Leadership (relevant to Workstream B)

| Name            | Title                               | Relevance                                                      |
| --------------- | ----------------------------------- | -------------------------------------------------------------- |
| Neil Bansal     | CEO                                 | Wharton MBA, finance/growth strategy background                |
| Trond Berg      | VP, Analytics & Commercial Strategy | Owns analytics function — likely stakeholder                   |
| Tami Klumb      | VP, PBM Services                    | Owns PBM operations — likely stakeholder                       |
| Christine Spath | Controller                          | Finance — CFO/VP Finance mentioned in scope as final approvers |
| Laurel Wala     | General Counsel & CCO               | Compliance workflows                                           |
| Andrea Talmage  | VP, Human Resources                 | HR workflows                                                   |

### Tech Stack

- **Microsoft 365** (Teams, Outlook, SharePoint, Excel) — confirmed
- **SharePoint** — confirmed as document management / intranet platform
- **Azure cloud** (data pipelines, microservices)
- **.NET Core / ASP.NET Core** applications
- **Power Platform** available (Power Automate, Power BI, Power Apps) — included with M365 licensing
- **Plenful partnership** (Oct 2023) — AI workflow automation for pharmacy operations
- **SoftWriters/FrameworkLTC integration** (Jul 2025) — delivery logistics API
- **HIPAA/SOC2/GDPR compliance** framework

### Company Culture Signals

- 3x consecutive Top Workplace (Milwaukee Journal Sentinel)
- Won "New Ideas" specialty award (2025) — leadership values innovation
- Hiring data engineers and app developers — still building infrastructure
- "That's the way we have always done it" resistance cited as industry challenge

---

## 2. Industry Context: Where Manual Work Lives

### The PBM/LTC Pharmacy Pain Point Map

**Confidence: HIGH** — synthesized from industry reports, job postings, vendor marketing, and trade publications.

| Pain Point                        | Industry Prevalence | SPS Relevance                                |
| --------------------------------- | ------------------- | -------------------------------------------- |
| Excel-driven client reporting     | Universal           | HIGH — Trinity does analytics/reporting      |
| Manual rebate reconciliation      | Universal           | HIGH — LithiaRx does rebate submission       |
| State-by-state compliance filings | Growing rapidly     | HIGH — regulatory tsunami 2025-2028          |
| Ad-hoc SQL reporting              | Very common         | MEDIUM — VP Analytics likely deals with this |
| Manual prior authorization        | Universal in PBMs   | MEDIUM — depends on SPS service scope        |
| Client onboarding paperwork       | Common              | MEDIUM — 75-90 day process industry-wide     |
| Data format normalization         | Universal           | MEDIUM — multiple data sources               |
| Invoice/billing reconciliation    | Universal           | HIGH — finance team                          |
| Contract analysis/extraction      | Common              | MEDIUM — depends on contract volume          |

### The Regulatory Tsunami

Federal and state PBM reform is creating massive new compliance reporting burdens:

- **2026**: MA staggered reporting deadlines, proposed ERISA transparency rules
- **2027**: CO delinking law effective
- **2028**: Federal PBM annual reporting to plan sponsors + HHS (July 1 deadline)
- **Penalties**: $10K/day for failure to disclose; $100K per false item

For a ~100-person company, manual compliance is unsustainable.

---

## 3. Likely Internal Workflows at SPS Health

Based on company structure, services offered, industry norms, and job posting evidence.

### Finance Department (Controller Christine Spath, reports to CFO)

**F1. Rebate Reconciliation** [Confidence: HIGH]

- LithiaRx submits rebates to manufacturers on behalf of pharmacy clients
- Reconciliation = matching manufacturer payments back to the specific claims that generated them
- Industry norm: done in spreadsheets, involves double/triple-checking, error-prone
- **Volume**: Likely monthly or quarterly cycles
- **Pain**: Discrepancies between submitted claims and received payments require manual investigation

**F2. Client Invoicing / Revenue Recognition** [Confidence: MEDIUM]

- SPS bills clients (pharmacies) for services: GPO membership, PSAO fees, LithiaRx adjudication fees, StatimRx delivery fees
- Multiple subsidiaries = multiple billing streams to consolidate
- **Pain**: Manual aggregation across subsidiary systems

**F3. GPO Vendor Payment Reconciliation** [Confidence: MEDIUM]

- GPO negotiates pricing with drug manufacturers/vendors
- Tracking whether vendors honor negotiated pricing across thousands of transactions
- **Pain**: Comparing contracted vs. actual pricing across purchase orders

### Analytics & Commercial Strategy (VP Trond Berg)

**A1. Client Reporting / Analytics Delivery** [Confidence: HIGH]

- Trinity provides "cutting edge analytics functionality" to clients
- Industry norm: analysts write custom SQL, build Excel reports, manually curate dashboards
- **Pain**: Each client wants slightly different views; manual report customization is time-consuming
- Job postings require "Advanced Excel" and SQL — hallmark of manual reporting

**A2. Data Ingestion and Normalization** [Confidence: HIGH]

- Claims data arrives from multiple pharmacy clients in different formats
- Industry-wide pain: "format changes come without notice"
- **Pain**: Manual ETL, format-specific parsing scripts, quality checks on each load

**A3. Contract Compliance Validation** [Confidence: MEDIUM]

- Trinity validates that client contracts are performing as guaranteed
- Comparing actual rebate/pricing performance vs. contractual guarantees
- **Pain**: Manual comparison of contract terms against claims data outcomes

### PBM Services (VP Tami Klumb)

**P1. Formulary Update Processing** [Confidence: HIGH]

- Quarterly/annual formulary changes (drug additions, removals, tier changes)
- Each change requires: clinical review documentation, client notification, system configuration update, compliance verification
- **Pain**: Multi-step process with multiple handoffs and manual tracking

**P2. Prior Authorization Processing** [Confidence: MEDIUM]

- If LithiaRx handles PA for clients: receive request → evaluate criteria → approve/deny → notify
- Industry: manual PA takes 10-14 days, $35B annual admin cost industry-wide
- SPS already partnered with Plenful (which automates PA) — may already be addressed

**P3. Claims Exception Handling** [Confidence: HIGH]

- LithiaRx adjudicates claims in real-time; rejected claims need exception review
- Batch reversals (like the KS August pattern in our case study) require investigation and reprocessing
- **Pain**: Manual review of claim rejections, coordination with pharmacies for resubmission

### Legal & Compliance (GC Laurel Wala)

**C1. State PBM Licensing & Registration** [Confidence: HIGH]

- PBMs must register/license in each state they operate
- Different requirements, different forms, different deadlines, different renewal cycles
- **Pain**: Tracking deadlines across 50 states, manual form completion, document gathering

**C2. Regulatory Reporting** [Confidence: HIGH]

- New federal transparency reporting requirements (2028 deadline)
- State-specific reporting (MA, CO, CA, etc.)
- **Pain**: Manual data aggregation, formatting to each state's requirements, deadline tracking

**C3. Contract Management** [Confidence: MEDIUM]

- Pharmacy network contracts, manufacturer agreements, client service agreements
- **Pain**: Tracking expiration dates, renewal terms, obligation compliance

### Client Services (EVP Theresa Hametz, EVP Matt Lewis)

**S1. Client Onboarding** [Confidence: HIGH]

- New pharmacy client joining GPO/PSAO/LithiaRx network
- Industry norm: 75-90 day process with credentialing, system setup, testing, go-live
- **Pain**: Manual checklist tracking, document collection, multi-system configuration

**S2. Client Issue Resolution / Ticketing** [Confidence: MEDIUM]

- Pharmacies contact SPS about claim rejections, delivery issues, formulary questions
- **Pain**: Manual tracking, no unified case management (common in small companies)

### StatimRx Operations

**L1. Delivery Exception Management** [Confidence: MEDIUM]

- Failed deliveries, STAT requests, courier coordination
- New FrameworkCourier API integration (Jul 2025) may be automating some of this
- **Pain**: Manual coordination when automated systems fail

**L2. Network Pharmacy Credentialing** [Confidence: MEDIUM]

- 70K+ retail pharmacy network requires credentialing and re-credentialing
- **Pain**: Manual verification of licenses, capabilities, compliance documentation

### Human Resources (VP Andrea Talmage)

**H1. Employee Onboarding** [Confidence: LOW]

- Standard HR workflow, but at ~100 employees, volume may not justify automation
- **Pain**: Paperwork, system access provisioning, training scheduling

---

## 4. Automation Opportunity Scoring

### Evaluation Framework (from Workstream B scope)

Each candidate scored on:

- **Impact**: Time saved, error reduction, frequency of workflow
- **Effort**: Complexity to build, data availability, integration requirements
- **Durability**: Can non-technical staff maintain it after internship?
- **Measurability**: Can we quantify before/after?
- **No-code/Low-code fit**: Can this be built without custom code?

### Scoring Matrix

| #   | Workflow                              | Impact | Effort | Durability | Measurability | No-Code Fit | **Score** |
| --- | ------------------------------------- | ------ | ------ | ---------- | ------------- | ----------- | --------- |
| F1  | Rebate Reconciliation                 | 5      | 3      | 4          | 5             | 3           | **20**    |
| A1  | Client Reporting                      | 5      | 4      | 3          | 5             | 3           | **20**    |
| C1  | State Licensing/Registration Tracking | 4      | 2      | 5          | 4             | 5           | **20**    |
| C2  | Regulatory Reporting                  | 5      | 4      | 3          | 5             | 3           | **20**    |
| S1  | Client Onboarding                     | 4      | 2      | 5          | 4             | 5           | **20**    |
| F2  | Client Invoicing                      | 4      | 3      | 4          | 5             | 3           | **19**    |
| P1  | Formulary Update Processing           | 4      | 3      | 4          | 4             | 3           | **18**    |
| A2  | Data Ingestion                        | 5      | 5      | 2          | 4             | 2           | **18**    |
| P3  | Claims Exception Handling             | 4      | 4      | 3          | 4             | 3           | **18**    |
| A3  | Contract Compliance                   | 3      | 3      | 4          | 4             | 3           | **17**    |
| C3  | Contract Management                   | 3      | 2      | 5          | 3             | 5           | **18**    |
| F3  | GPO Vendor Reconciliation             | 3      | 3      | 4          | 4             | 3           | **17**    |
| S2  | Client Issue Ticketing                | 3      | 2      | 4          | 3             | 5           | **17**    |
| L2  | Network Credentialing                 | 3      | 3      | 4          | 3             | 4           | **17**    |

_(Scale: 1=low, 5=high. For Effort, 5=easy, 1=hard.)_

---

## 5. Top Automation Candidates for Workstream B

### Tier 1: Highest Confidence Recommendations (present to CFO/VP Finance)

#### Candidate A: Compliance & Licensing Tracker

**Workflow**: C1 (State PBM Licensing) + C3 (Contract Management)
**Why it scores well**:

- Regulatory pressure is exploding — this solves a growing pain before it becomes a crisis
- Highly structured data (deadlines, requirements, documents) → perfect for no-code tools
- Non-technical staff can maintain a tracker/dashboard
- Measurable: missed deadlines → 0, time spent tracking → reduced by X%
- **Tool candidates**: SharePoint List + Power Automate (zero additional licensing — already in M365). SharePoint List stores state registrations, deadlines, document links, and status. Power Automate sends automated reminders at 90/60/30/7 days before expiration, escalates overdue items, and triggers renewal checklists.
- **Deliverable**: Centralized compliance dashboard with automated deadline reminders, document checklists per state, renewal workflow triggers — all maintained in SharePoint by non-technical staff

#### Candidate B: Client Onboarding Workflow

**Workflow**: S1 (Client Onboarding)
**Why it scores well**:

- 75-90 day process with clear, repeatable steps → natural workflow automation target
- Currently likely tracked in spreadsheets/email
- Non-technical staff are the primary users
- Measurable: onboarding time, dropped tasks, client satisfaction
- **Tool candidates**: SharePoint onboarding site (built-in templates available since 2025) + Power Automate task flows. SharePoint provides the portal (checklists, document upload, status tracking), Power Automate drives the workflow (new client triggers task creation, notifies responsible parties, escalates stalled steps). Microsoft Forms for document collection.
- **Deliverable**: Automated onboarding pipeline with task dependencies, document collection forms, status dashboards, automated notifications at key milestones — all within the SharePoint environment staff already use

#### Candidate C: Rebate Reconciliation Assistant

**Workflow**: F1 (Rebate Reconciliation)
**Why it scores well**:

- Finance team (CFO/VP Finance are the approvers — this is their pain)
- High frequency, high error cost, highly measurable
- **But**: More technically complex — requires data from adjudication system
- **Tool candidates**: Excel/Power Query automation, Power Automate, or Plenful (existing partner)
- **Deliverable**: Semi-automated reconciliation workbook/dashboard that highlights discrepancies, tracks resolution, and produces audit trail
- **Risk**: May overlap with Plenful partnership scope — verify in discovery

### Tier 2: Strong Candidates (explore in discovery)

#### Candidate D: Client Reporting Templates

**Workflow**: A1 (Client Reporting)
**Why it scores well**:

- Directly serves revenue-generating function
- Analysts spend hours customizing reports → templates reduce to minutes
- **But**: Requires understanding their current analytics stack (likely Power BI given Azure)
- **Tool candidates**: Power BI templates (likely already in use given Azure stack), SharePoint-embedded dashboards, or Excel/Power Query templates distributed via SharePoint document library
- **Risk**: May be too intertwined with their custom data infrastructure

#### Candidate E: Regulatory Reporting Pipeline

**Workflow**: C2 (Regulatory Reporting)
**Why it scores well**:

- Federal deadline in 2028 — building now means being ready early
- **But**: Requirements are still being finalized (proposed rules)
- Better as a "phase 2" project after compliance tracker is in place

---

## 6. Discovery Session Strategy

When you meet with department leaders, use this research to ask informed questions rather than starting from zero:

### Questions for Finance (CFO / VP Finance / Controller)

1. "How do you currently reconcile manufacturer rebate payments against submitted claims? What tools do you use?"
2. "How many hours per cycle does rebate reconciliation take? What's the error rate?"
3. "How do you track invoicing across the three subsidiaries — is there a unified system?"
4. "What's the most time-consuming repetitive task your team does each month?"

### Questions for Compliance (General Counsel)

1. "How many states do you currently hold PBM registrations in? How do you track renewal deadlines?"
2. "Are you preparing for the 2028 federal PBM transparency reporting requirements yet?"
3. "What's your current process for tracking regulatory changes across states?"
4. "Have you had any close calls with compliance deadlines?"

### Questions for Client Services (EVPs)

1. "Walk me through what happens when a new pharmacy client signs up — what are the steps from contract to go-live?"
2. "How do you track onboarding progress? Spreadsheet? Project management tool?"
3. "What are the most common reasons onboarding takes longer than expected?"
4. "How do pharmacy clients report issues to you? How do you track resolution?"

### Questions for Analytics (VP Berg)

1. "What does a typical client reporting cycle look like? How much is automated vs. manual?"
2. "What tools does your team use for analytics delivery — Power BI, Excel, custom dashboards?"
3. "How do you handle different data formats when onboarding a new pharmacy's claims data?"
4. "What takes the most analyst time that feels like it shouldn't?"

### Questions for PBM Services (VP Klumb)

1. "When the formulary changes quarterly, what's the update process? How many steps and handoffs?"
2. "How do you handle claims that get rejected — what's the exception workflow?"
3. "Is Plenful currently automating any of your workflows? What's in scope vs. out of scope?"

---

## 7. Impact-Effort Framework for Discovery Sessions

Use this 2x2 to plot workflows during/after discovery:

```
                    HIGH IMPACT
                        │
         Quick Wins     │    Strategic Projects
         (DO FIRST)     │    (PLAN CAREFULLY)
                        │
    ────────────────────┼────────────────────
                        │
         Fill-ins       │    Avoid / Defer
         (IF TIME)      │    (TOO COSTLY)
                        │
                    LOW IMPACT

    LOW EFFORT ─────────────────── HIGH EFFORT
```

**Prediction based on research**:

- **Quick Wins**: Compliance tracker, onboarding workflow
- **Strategic Projects**: Rebate reconciliation, client reporting templates
- **Fill-ins**: Contract management tracker, issue ticketing
- **Avoid/Defer**: Data ingestion automation (needs engineering), claims exception handling (too integrated with core systems)

---

## 8. Tool Recommendations for No-Code/Low-Code Solutions

SPS Health is confirmed on Microsoft 365 with SharePoint. This makes the Power Platform the primary tooling layer — zero additional licensing cost, IT-supported, and staff already have accounts.

### Primary Tools (already licensed, zero additional cost)

| Tool                 | Best For                                                       | Learning Curve | Durability |
| -------------------- | -------------------------------------------------------------- | -------------- | ---------- |
| **SharePoint Lists** | Structured data tracking (compliance, onboarding, contracts)   | Low            | High       |
| **SharePoint Sites** | Portals, document libraries, team dashboards                   | Low            | High       |
| **Power Automate**   | Workflow triggers, approval routing, notifications, scheduling | Medium         | High       |
| **Power BI**         | Analytics dashboards, report templates, embedded visuals       | Medium         | High       |
| **Microsoft Forms**  | Data collection, intake forms, surveys                         | Low            | High       |
| **Power Apps**       | Custom lightweight apps on top of SharePoint data              | Medium-High    | High       |

### SharePoint-Specific Automation Patterns

These are proven, low-effort automations that map directly to SPS workflows:

**Document Approval Workflows** — SharePoint + Power Automate routes contracts, policy changes, and compliance docs through multi-stage approvals. Auto-notifies approvers, tracks status, escalates on timeout. Directly relevant to formulary changes (P1), contract management (C3), and regulatory filings (C2).

**Document Library Auto-Organization** — Files uploaded to SharePoint auto-tagged with metadata (content type, department, client, date). Power Automate moves files to correct folders, applies retention labels, notifies owners. Relevant for RFP responses, compliance docs, claims documentation.

**SharePoint List as Lightweight Tracker** — Custom lists with views, filters, and conditional formatting act as mini-applications. No database needed. Power Automate sends reminders on due dates and escalates overdue items. Ideal for compliance tracking (C1), contract expiration (C3), and client onboarding milestones (S1).

**Form-to-Workflow Pipelines** — Microsoft Forms embedded in SharePoint pages feed directly into Power Automate flows. Use cases: PTO requests, IT provisioning, expense pre-approvals, client intake forms. 15-minute setup, highly visible, good training exercise for Week 6.

**Email-to-SharePoint Archiving** — Shared mailbox emails auto-saved to SharePoint document library with metadata. Builds audit trail without manual filing. Relevant for claims correspondence, vendor communications, client issue tracking (S2).

**Knowledge Bot Document Source** — SharePoint document libraries serve as the canonical intake for the RAG pipeline (Automation #1 in strategy deck). Staff add/remove docs in SharePoint (familiar interface), the Python backend watches the library via Microsoft Graph API or Power Automate trigger. No new tool for document management.

### Secondary Tools (if specific needs arise)

| Tool        | Best For                              | Pricing            | When to Use                                |
| ----------- | ------------------------------------- | ------------------ | ------------------------------------------ |
| **Plenful** | Pharmacy-specific workflow automation | Enterprise pricing | If PA or pharmacy ops workflows are target |
| **Zapier**  | Cross-tool automations outside M365   | Free → $20/mo      | Only if connecting non-Microsoft tools     |

**Recommendation**: Build everything on **SharePoint + Power Automate + Power BI**. Zero additional licensing cost, staff already have accounts, IT already supports it. Third-party tools (Airtable, Monday, Notion) add adoption friction and recurring costs with no clear upside when Power Platform is available.

---

## 9. Open Questions (Verify in Discovery)

1. **What does Plenful currently automate?** The Oct 2023 partnership may already cover some of these workflows. Don't duplicate.
2. ~~**Are they on Microsoft 365?**~~ **ANSWERED**: Confirmed M365 with SharePoint. Power Platform available at no extra cost.
3. **What's the current analytics stack?** Power BI vs. custom vs. Excel-only affects Candidate D. (Power BI is likely given M365 + Azure stack.)
4. **Who are the CFO and VP Finance?** Not publicly listed — these are the final approvers per your scope doc.
5. **How many states do they operate in?** Determines compliance tracker scope.
6. **What's the client count?** Affects onboarding workflow volume and ROI calculation.
7. **Is there an existing project management tool?** Jira, Asana, Monday, SharePoint-based tracking, or just email/spreadsheets?
8. **What does "non-technical" mean here?** Comfortable with Excel? Or truly no-spreadsheet users?

---

## 10. Confidence Summary

| Finding                                            | Confidence | Evidence                                       |
| -------------------------------------------------- | ---------- | ---------------------------------------------- |
| SPS is a ~100-person PE-backed PBA platform        | HIGH       | LinkedIn, Crunchbase, press releases           |
| They have LithiaRx, Trinity, StatimRx subsidiaries | HIGH       | Company website, press releases                |
| Azure/.NET tech stack                              | HIGH       | Job postings                                   |
| Microsoft 365 + SharePoint in use                  | HIGH       | Confirmed by SPS contact (2026-02-25)          |
| Power Platform available (no extra licensing)      | HIGH       | Follows from confirmed M365 subscription       |
| Plenful AI partnership exists                      | HIGH       | Press release Oct 2023                         |
| Rebate reconciliation is manual/Excel-driven       | HIGH       | Industry-wide pattern, SPS offers this service |
| Client reporting involves manual SQL/Excel work    | HIGH       | Job posting requirements, industry pattern     |
| Compliance burden is growing rapidly               | HIGH       | Federal/state legislation verified             |
| Client onboarding is a 75-90 day manual process    | MEDIUM     | Industry norm, not SPS-specific verification   |
| They use Power BI for analytics                    | MEDIUM     | Inferred from Azure stack + confirmed M365     |
| HR/internal workflows are pain points              | LOW        | Small company, may not be high-volume enough   |
