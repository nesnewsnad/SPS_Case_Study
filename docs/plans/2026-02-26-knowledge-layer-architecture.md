# Workstream B: Layered Knowledge Architecture — Brainstorming

**Date**: 2026-02-26
**Status**: Brainstorm — pre-discovery, conceptual architecture
**Context**: SPS Health internship Workstream B (2-3 automations), starting with the knowledge bot

---

## 1. Core Thesis

Don't build a comprehensive knowledge base first and attach automations to it. Instead, build each automation and let the knowledge layers emerge bottom-up. Each workflow is a drill bit that excavates downward through the layers, depositing structured knowledge at every level it passes through.

This is analogous to RAPTOR (Recursive Abstractive Processing for Tree-Organized Retrieval) but applied to institutional knowledge rather than document retrieval — and built in reverse. Start at the leaf (a specific workflow), discover what department knowledge it depends on, which forces you to articulate the core institutional knowledge underneath.

---

## 2. Two Disciplines

**Context engineering** gives the AI the facts — what SPS Health is, how processes work, what the documents say.

**Intent engineering** gives the AI the judgment — how a great tenured employee would handle a situation, what trade-offs are acceptable, when to answer vs. hedge vs. refuse. The difference between "here's the invoice approval policy" and "here's how a 10-year AP clerk would handle a $47K invoice from a new vendor that came in on a Friday before quarter-close."

Both are required. Context without intent produces correct but brittle answers. Intent without context produces confident but wrong ones.

---

## 3. The Four Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                        QUERY ENTERS                                 │
│              "Can I use my HSA for my daughter's ortho?"            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  INTENT LAYER — "How would a great employee handle this?"           │
│                                                                     │
│  Decomposes every query into a judgment schema:                     │
│  ├── Domain classification (Benefits → HSA → Eligible Expenses)     │
│  ├── Specificity detection (dependent coverage, not just employee)  │
│  ├── Authoritative source requirement (plan doc + IRS pub)          │
│  ├── Temporal scope (current plan year)                             │
│  ├── Confidence gate (can answer / hedge / refuse)                  │
│  ├── Escalation path (who to contact if hedged or refused)          │
│  └── Tone directive (helpful, not legalistic)                       │
│                                                                     │
│  THIS IS THE QUALITY CONTROL LAYER. It decides whether the bot      │
│  should answer at all, how confident it should be, and what a       │
│  trustworthy answer looks like — before retrieval even happens.     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  WORKFLOW LAYER — "How this bot runs"                               │
│                                                                     │
│  ├── RAG pipeline config                                            │
│  │   ├── Chunking: 512 tokens, 2-sentence overlap                  │
│  │   ├── Retrieval: hybrid (vector 70% + BM25 30%, RRF merge)      │
│  │   ├── Generation: Claude Sonnet, cite sources, flag low conf     │
│  │   └── Future: escalate to agentic step if confidence < threshold │
│  ├── Document ingestion (SharePoint folder watch → auto-ingest)     │
│  ├── Response format (answer first, source citation, caveats last)  │
│  ├── Escalation triggers (PHI detected → refuse, no docs → human)  │
│  └── Maintenance runbook (add docs, check quality, retrain embeds)  │
│                                                                     │
│  OPERATIONAL. Config and plumbing. A non-technical person can       │
│  add documents and read the runbook without understanding the code. │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  DEPARTMENT LAYER — "What HR/Finance/Ops knows"                     │
│                                                                     │
│  HR corpus (first target):                                          │
│  ├── Terminology: what "open enrollment" means at SPS specifically  │
│  ├── Document hierarchy: policy doc > summary email > Slack answer  │
│  ├── Temporal rules: 2026 guide supersedes 2024, effective dates    │
│  ├── Ownership map: benefits → Sarah, 401k → TPA, COBRA → payroll  │
│  └── Common misunderstandings: what employees actually mean         │
│                                                                     │
│  Finance corpus (added with automation #2):                         │
│  ├── GL code structure, approval thresholds, fiscal calendar        │
│  ├── Vendor relationships, invoice routing rules                    │
│  └── ...discovered during invoice processing workflow build         │
│                                                                     │
│  GROWS WITH EACH AUTOMATION. The second workflow doesn't start      │
│  from zero — it inherits the core and adds its department layer.    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  CORE LAYER — "What SPS Health is"                                  │
│                                                                     │
│  ├── Identity: PBM — sits between health plans, pharmacies, mfrs   │
│  ├── Org structure: departments, reporting lines, decision-makers   │
│  ├── Compliance: HIPAA boundaries, PHI definitions, secure channels │
│  ├── Communication norms: Teams vs email vs SharePoint, tone        │
│  ├── Business calendar: fiscal year, enrollment, quarterly cycles   │
│  └── Glossary: formulary, adjudication, NDC, rebate, MAC pricing   │
│                                                                     │
│  DISCOVERED, NOT DESIGNED. Each workflow you build forces you to    │
│  articulate pieces of this layer. Over time it becomes the shared   │
│  foundation that every automation reads from.                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. How the Drill-Down Works

```
Automation #1: Knowledge Bot (HR focus)
  ├── Builds: Intent layer (query decomposition schema)
  ├── Builds: Workflow layer (RAG pipeline)
  ├── Builds: Department layer (HR corpus)
  └── Discovers: Core layer (org structure, HIPAA rules, glossary, norms)

Automation #2: Invoice Processing
  ├── Reuses: Intent layer (same decomposition pattern, new domain templates)
  ├── Builds: Workflow layer (Power Automate + AI Builder pipeline)
  ├── Builds: Department layer (Finance corpus)
  └── Extends: Core layer (adds vendor relationships, fiscal calendar, GL structure)

Automation #3: [TBD from discovery]
  ├── Reuses: Intent layer (pattern is now proven)
  ├── Builds: Workflow layer (whatever the automation needs)
  ├── Builds: Department layer (new domain)
  └── Extends: Core layer (now substantial — 3 departments have contributed)
```

---

## 5. What Persists After the Internship

The code is just plumbing. What actually persists is the knowledge layers:

- **Core layer** — a living document (CLAUDE.md pattern or equivalent) that any future AI tool at SPS can load. Institutional memory in machine-readable form.
- **Department layers** — curated, hierarchical document corpora with metadata (authority, recency, ownership). Not just files in a folder — structured knowledge.
- **Intent layer** — the judgment schemas. These encode how SPS makes decisions, not just what it knows. Hardest to rebuild if lost, most valuable thing the internship leaves behind.
- **Workflow layer** — runbooks, configs, maintenance docs. Replaceable, but necessary.

---

## 6. Key Architectural Decisions

| Decision                                      | Choice                                                               | Rationale                                                                                                                                                                                             |
| --------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RAG vs. agentic search                        | RAG (pipeline), architect for agentic escalation later               | Early-maturity org needs predictability and explainability. Non-technical maintainers can't debug agent reasoning.                                                                                    |
| Top-down vs. bottom-up knowledge construction | Bottom-up (workflow-driven)                                          | Can't enumerate "everything SPS knows" in advance. Build through specific automations, let the core emerge. Supported by "Codified Context" paper (Feb 2026) and industry consensus.                  |
| Context + intent as separate concerns         | Yes                                                                  | Context without intent = correct but brittle. Intent without intent = confident but wrong. The intent layer (judgment schemas) is the differentiator between a search engine and a trusted colleague. |
| Knowledge format                              | Machine-readable structured docs (CLAUDE.md pattern)                 | Documentation as load-bearing infrastructure. The AI reads it on every invocation — not optional reference material.                                                                                  |
| Agent-readability as design constraint        | Yes — all deposits must be agent-executable, not just human-readable | Informed by Nate's "4 Prompt Layers" framework (Feb 2026). Every document in the org is a specification an agent will eventually read and act on. Format rules per layer below.                       |

---

## 6a. Agent-Readability Formatting Rules

Every knowledge deposit must be written so an agent can consume and act on it without human interpretation. This is a constraint on format, not content.

**Ref**: Nate's "4 Prompt Layers" framework — prompt craft → context engineering → intent engineering → specification engineering. Our knowledge layers map to his stack: Core/Department = context engineering, Intent = intent engineering, Workflow = specification engineering. The insight: the higher up the stack, the more the format matters for autonomous agent execution.

### Core Layer — structured key-value, not prose

```
# Bad (human-readable narrative)
SPS Health is a pharmacy benefit manager that sits between health plans,
pharmacies, and drug manufacturers.

# Good (agent-readable structured fact)
entity_type: PBM (Pharmacy Benefit Manager)
position: intermediary between health plans, pharmacies, and drug manufacturers
```

Rule: every Core deposit is a **fact with a key**. If you can't name the key, it's not a Core fact — it's narrative that belongs elsewhere.

### Department Layer — structured metadata, explicit authority

```
# Bad
The 2026 benefits guide is the most current one.

# Good
document: 2026 Benefits Guide
authority: PRIMARY (supersedes 2024 Benefits Guide)
effective: 2026-01-01
owner: Sarah (Benefits)
scope: all employees
```

Rule: every Department deposit carries **authority, recency, ownership, and scope**. An agent must be able to resolve conflicts between two documents without asking a human.

### Intent Layer — explicit trade-off hierarchies, not descriptions

```
# Bad
They tend to be careful with high-dollar invoices from new vendors.

# Good
WHEN invoice > $10K AND vendor is new (< 90 days)
PREFER escalate to manager OVER auto-approve
BECAUSE fraud risk outweighs processing speed
CONFIDENCE: STATED (Speaker: Lucas, 2026-03-01)
```

Rule: every Intent deposit is a **conditional rule with a trade-off**. "Prefer X over Y when Z because W." An agent must be able to apply the judgment without interpreting prose.

### Workflow Layer — specs with acceptance criteria, not narrative SOPs

```
# Bad
When an invoice comes in, we check the PO number, then route it
to the right approver based on the amount.

# Good
process: invoice_routing
trigger: new invoice received
steps:
  1. extract PO number from invoice
  2. match PO to open purchase orders in [system]
  3. route by amount:
     - < $5K → auto-approve
     - $5K-$25K → department manager
     - > $25K → VP Finance
done_when: invoice has approval status + GL code assigned
failure_mode: no PO match → hold queue + notify AP clerk
```

Rule: every Workflow deposit is a **specification with trigger, steps, done-when, and failure mode**. An agent must be able to execute or evaluate the process without asking "what happens next?"

---

## 7. Research Backing

Key sources that validate this approach:

- **"Context engineering"** — formalized by Karpathy (June 2025), Anthropic (Sept 2025), dropped "prompt engineering" from Gartner 2025 Hype Cycle
- **"Codified Context" paper** (Feb 2026) — three-component architecture (hot-memory constitution, specialist agents, cold-memory knowledge base) built incrementally over 283 sessions
- **Intent engineering** — emerging discipline (late 2025). Klarna case study: saved $60M, broke the company. Deployed AI without organizational intent alignment.
- **Bottom-up construction** — industry consensus: start with high-impact workflows, build knowledge as a byproduct of solving real problems
- **MCP** — Model Context Protocol, now vendor-neutral under Linux Foundation. The connective tissue for future multi-workflow architectures.

---

## 8. Open Questions (for discovery)

1. Which department's documents are most accessible and highest-volume for the first corpus?
2. What does the SharePoint folder structure look like? Is there a document hierarchy already?
3. Who are the "excellent tenured employees" whose judgment we're encoding? Can we shadow them?
4. Does SPS have Azure (deployment target) or do we need an alternative?
5. What does HIPAA exposure look like for an internal Q&A bot? PHI in HR docs?
6. What intent patterns emerge from the first 50 real employee questions?
