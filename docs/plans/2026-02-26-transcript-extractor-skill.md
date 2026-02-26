---
name: transcript-extractor
description: Extract structured knowledge layer deposits from meeting transcripts. Use when the user provides a meeting transcript (from Otter or any other source) for processing into the SPS Health layered knowledge architecture.
---

# Transcript → Knowledge Layer Extractor

## Purpose

Process meeting transcripts and extract structured deposits across the four knowledge layers defined in the SPS Health knowledge architecture. Every meeting contributes to the institutional knowledge base.

## When to Use

- User provides a transcript file or pastes transcript text
- User says "process this meeting" or "extract from this transcript"
- User references Otter, a meeting recording, or a discovery session

## Classification Logic

Before extracting, classify every piece of information against these rules. Each rule has a **signal** (what to look for in the transcript) and a **test** (how to verify correct classification).

### Core Layer — "What SPS Health is"

Institutional facts true across all departments and workflows.

| Signal                                           | Example from transcript                                               |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| Company-wide identity statements                 | "We're a PBM", "We sit between health plans and pharmacies"           |
| Org structure: people + titles + reporting lines | "Lucas is VP Finance, reports to JC"                                  |
| Compliance constraints that apply universally    | "Everything has to be HIPAA-compliant", "We can't put PHI in Teams"   |
| Terms used across multiple department contexts   | "Adjudication", "formulary", "NDC"                                    |
| Company-wide calendar/cycles                     | "Our fiscal year starts in July", "Board meets quarterly"             |
| Communication norms that span the org            | "We use Teams for everything", "Policy changes go through SharePoint" |

**Classification test**: Would a new employee in ANY department need to know this? If yes → Core.

### Department Layer — "What [department] knows"

Knowledge scoped to one team's domain. Becomes relevant when building automations for that department.

| Signal                                    | Example from transcript                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| Domain-scoped terminology                 | "In Finance, we call that a GL code", "MAC pricing is how we..."          |
| Document authority rankings               | "The policy doc is the real source, not the summary email"                |
| Topic ownership within a department       | "COBRA goes to payroll, not HR", "Benefits questions go to Sarah"         |
| Temporal versioning of dept documents     | "The 2026 guide replaces the 2024 one", "That policy took effect March 1" |
| Department-specific acronyms or shorthand | "We call it the 'TPA' internally"                                         |
| Corrections of common employee confusion  | "People always think X, but it's actually Y"                              |

**Classification test**: Would this ONLY matter to someone working in THIS department (or asking this department a question)? If yes → Department.

### Intent Layer — "How a great employee handles this"

Judgment, decision logic, and tacit knowledge. The difference between knowing the policy and knowing how to apply it. ALWAYS prefer direct quotes — judgment is most valuable in the speaker's own words.

| Signal                              | Example from transcript                                                           |
| ----------------------------------- | --------------------------------------------------------------------------------- |
| Conditional decision logic          | "If it's over $10K, I always check with...", "For new vendors, I never just..."   |
| Confidence boundaries               | "I'd answer that confidently" vs. "I'd never answer that without checking"        |
| Hedging / refusal patterns          | "That's not my area, I'd send them to...", "I wouldn't touch that one"            |
| Implicit prioritization             | "The thing I worry about most is...", "I'd let that slide but never this"         |
| Reframing what people actually mean | "When they ask about PTO rollover, they really want to know if they'll lose days" |
| Risk assessment heuristics          | "That's a red flag because...", "I'd escalate anything that looks like..."        |
| Experience-based shortcuts          | "After 5 years, I've learned that...", "The trick with these is..."               |

**Classification test**: Is this JUDGMENT rather than FACT? Could you only learn this from experience, not from reading a document? If yes → Intent.

### Workflow Layer — "How work actually moves"

Processes, tools, pain points, and workarounds. The raw material for automation candidates.

| Signal                                | Example from transcript                                                    |
| ------------------------------------- | -------------------------------------------------------------------------- |
| Sequential process descriptions       | "First we do X, then Y, then Z", "The invoice goes from... to... to..."    |
| Tool and system references            | "We track that in SharePoint", "It's all in this Excel spreadsheet"        |
| Time/effort complaints                | "I spend 3 hours every month on...", "This takes forever because..."       |
| Manual workarounds                    | "The system doesn't do that so we just...", "I copy-paste from... into..." |
| Handoff points between people/systems | "Then I send it to... and they...", "It sits in their inbox until..."      |
| Failure modes                         | "It breaks when...", "We lose track of things when..."                     |

**Classification test**: Is this describing HOW WORK MOVES through a process? If yes → Workflow.

### Ambiguous Cases

Some information spans layers. Apply these tiebreakers:

- **Fact about the company** that a department person states → Core (not Department)
- **Process that only one department runs** → Workflow (not Department). Department layer is _knowledge_, Workflow layer is _process_.
- **"We always do X"** → check if it's policy (Core/Department) or judgment (Intent). Policy = written down somewhere. Judgment = learned through experience.
- **Tool mentioned in passing** → Workflow. Tool with opinion about it ("SharePoint is terrible for this") → Workflow (pain point).
- If genuinely ambiguous, deposit in BOTH layers with a note: `[also deposited in X layer]`

---

## Extraction Process

### Step 1: Read the raw transcript

Read the full transcript. Do not edit, summarize, or truncate the original. Identify speakers if possible.

### Step 2: First pass — tag signals

Read through the transcript and tag each substantive statement with its layer classification using the signal tables above. Skip filler, greetings, and off-topic conversation.

### Step 3: Extract into structured schema

Organize tagged statements into the output schema below. Only populate sections where the transcript contains real evidence. Leave sections empty rather than guessing.

```
# Knowledge Extraction: [meeting topic]

**Source**: [transcript filename]
**Date**: YYYY-MM-DD
**Speakers**: [names and roles if known]
**Meeting type**: [discovery / shadow / standup / 1:1 / other]

---

## Core Layer Deposits — "What SPS Health is"

### Identity & Business Model
- [deposit] — [STATED/INFERRED/VERIFY] (Speaker: [name])

### Org Structure
- [deposit] — [STATED/INFERRED/VERIFY] (Speaker: [name])

### Compliance & Boundaries
- [deposit] — [STATED/INFERRED/VERIFY] (Speaker: [name])

### Communication Norms
- [deposit] — [STATED/INFERRED/VERIFY] (Speaker: [name])

### Business Calendar
- [deposit] — [STATED/INFERRED/VERIFY] (Speaker: [name])

### Glossary
- **[term]**: [definition as used at SPS] — [STATED/INFERRED/VERIFY] (Speaker: [name])

---

## Department Layer Deposits — "What [department] knows"

### Department: [identified from transcript]

### Terminology
- **[term]**: [SPS-specific meaning] — [STATED/INFERRED/VERIFY] (Speaker: [name])

### Document Hierarchy
- [document] > [document] — [STATED/INFERRED/VERIFY] (Speaker: [name])

### Temporal Rules
- [rule: what supersedes what, effective dates] — [STATED/INFERRED/VERIFY] (Speaker: [name])

### Ownership Map
- [topic] → [person/role] — [STATED/INFERRED/VERIFY] (Speaker: [name])

### Common Misunderstandings
- Employees ask: "[what they say]" → They mean: "[what they actually want]" — [STATED/INFERRED/VERIFY] (Speaker: [name])

---

## Intent Layer Deposits — "How a great employee handles this"

### Judgment Patterns
- "[direct quote or close paraphrase]" — [STATED/INFERRED/VERIFY] (Speaker: [name])
  - Trigger: [when this judgment applies]
  - Action: [what they do]

### Escalation Instincts
- [topic] → escalate to [person/role] because [reason] — [STATED/INFERRED/VERIFY] (Speaker: [name])

### Tone & Framing
- [how they deliver answers in this domain] — [STATED/INFERRED/VERIFY] (Speaker: [name])

### Implicit Priorities
- [what they protect / what they'd let slide] — [STATED/INFERRED/VERIFY] (Speaker: [name])

---

## Workflow Layer Deposits — "How processes actually work"

### Processes Described
- **[process name]**: [step 1] → [step 2] → [step 3] — [STATED/INFERRED/VERIFY] (Speaker: [name])

### Tools & Systems
- **[tool]**: used for [purpose] — [STATED/INFERRED/VERIFY] (Speaker: [name])

### Pain Points
- [what's slow/broken/manual] — estimated time waste: [if mentioned] — [STATED/INFERRED/VERIFY] (Speaker: [name])

### Workarounds
- [unofficial shortcut or manual fix] — [STATED/INFERRED/VERIFY] (Speaker: [name])

---

## Action Items
- [ ] [task] — owner: [name] — by: [date if mentioned]

## Documents to Obtain
- [ ] [document name/description] — from: [person/location] — for: [which layer it feeds]

## People to Follow Up With
- [ ] [name] — [reason] — suggested by: [who mentioned them]

## Open Questions
- [question] — raised by: [context]

---

## Extraction Metadata

- **Total deposits**: [count per layer: Core: N, Department: N, Intent: N, Workflow: N]
- **Confidence breakdown**: [STATED: N, INFERRED: N, VERIFY: N]
- **Layers with no deposits**: [list — these are gaps to explore in follow-up meetings]
- **PHI flags**: [any content flagged and excluded]
```

### Step 4: Save the output

Save to two locations:

1. **Raw transcript**: `docs/knowledge/transcripts/YYYY-MM-DD-[meeting-topic].txt` — untouched original
2. **Extraction**: `docs/knowledge/extractions/YYYY-MM-DD-[meeting-topic].md` — the structured output

### Step 5: Suggest layer updates

Based on the extraction, suggest specific updates to the living knowledge layer files:

- `docs/knowledge/core.md` — institutional knowledge
- `docs/knowledge/departments/[dept].md` — department knowledge
- `docs/knowledge/intent/[domain].md` — judgment patterns

Do NOT auto-update these files. Present the suggested additions and let the user approve. The user is the quality gate.

---

## Rules

- NEVER edit the raw transcript
- NEVER fabricate information not in the transcript — empty sections are fine
- ALWAYS apply the classification logic above — use the signal tables and tests, not vibes
- ALWAYS tag confidence levels (STATED / INFERRED / VERIFY)
- ALWAYS preserve speaker attribution
- ALWAYS include extraction metadata (deposit counts, confidence breakdown, gap analysis)
- Prefer direct quotes for intent layer deposits — judgment patterns are most valuable in the speaker's own words
- Flag anything that sounds like PHI or patient-specific information — do not include it in the extraction
- When ambiguous, deposit in both layers with a cross-reference note
