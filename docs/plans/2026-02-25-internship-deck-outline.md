# Slide Deck Outline — SPS Health AI Implementation Intern Strategy

**Instructions for deck generation**: Create a professional 16:9 presentation with a clean, modern design. Use a color palette of deep navy (#1C2833), teal (#277884), white (#FFFFFF), and a coral accent (#FE4447) for emphasis. Use Arial throughout. Keep slides minimal — no walls of text. Use visual hierarchy, icons where appropriate, and consistent spacing.

---

## Slide 1: Title Slide

**AI Implementation Intern**
**Strategy & Work Plan**

SPS Health | March–May 2026

Dan Swensen

---

## Slide 2: Three Workstreams

**Title**: The Three Workstreams

Three equal columns:

| Workstream A                                            | Workstream B                                       | Workstream C                                           |
| ------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------ |
| AI Training Program                                     | Workflow Automation                                | Strategic Recommendations                              |
| Build organizational AI capability across 5 departments | Deploy 2–3 durable, no-code-maintained automations | CEO presentation with ROI analysis and forward roadmap |
| 15–25 employees trained                                 | Quantified time savings                            | AI governance framework                                |

---

## Slide 3: Timeline Overview

**Title**: 12-Week Timeline

Horizontal timeline with 4 phases:

- **Weeks 1–3**: Discovery & Onboarding — discovery sessions, workflow shortlist, pre-assessment, training weeks 1–3
- **Weeks 4–9**: Build & Deliver — deploy automations, deliver workshops, 1:1 coaching, mid-point status update
- **Weeks 10–12**: Measure & Present — impact metrics, documentation, knowledge transfer, CEO presentation

Bottom bar: Weekly check-in with CFO (JC) and VP Finance (Lucas Niemi)

---

## Slide 4: Section Divider — Workstream A

**AI Training Program**

"From ad hoc AI usage to AI-native thinking"

---

## Slide 5: Training Philosophy

**Title**: Teaching Approach

Three key principles in a horizontal layout:

1. **Bottom-Up Foundation** — Build mental models before tools. Understand what AI actually is before using it.
2. **Terminal-Native** — Learn AI by using it on real work files, in a real environment. Not in a disconnected chat window.
3. **Platform-Agnostic** — Core concepts apply to any tool. Tool-specific modules added once platform decision is finalized.

---

## Slide 6: Theoretical Framework

**Title**: Six Core Concepts (adapted from Wharton OIDD 6670)

Two-column layout, 3 items per column:

Left column:

- **LLMs as Approximate Retrievers** — They don't "know" things. They pattern-match against training data. This explains hallucination, inconsistency, and opacity.
- **The Jagged Frontier** — AI capabilities are uneven. Great at some tasks, terrible at others. The boundary isn't obvious and shifts constantly.
- **Compound AI Systems** — LLMs are one ingredient, not the whole meal. Real solutions combine LLMs with data, tools, and human judgment.

Right column:

- **Four Perspectives** — Every AI decision evaluated as Engineer, Manager, Strategist, and Citizen.
- **Ad Hoc to Glass-Box** — Progression from copy-paste prompting to integrated workflows where AI operates directly on your files.
- **12 Essential Questions** — AI governance framework: Discovery, Measurement, Mitigation, Accountability.

---

## Slide 7: Curriculum — Phase 1

**Title**: Phase 1: Foundations — "What is this thing?" (Weeks 1–3)

Three cards, one per week:

**Week 1: Terminal + First AI Interaction**
Core concept: Approximate Retrieval
Exercise: Point AI at a real work file. Then ask it something it can't know — watch it hallucinate.

**Week 2: Reading, Writing, Editing with AI**
Core concept: Jagged Frontier
Exercise: Do a real task with AI. Map where it's great and where it fails.

**Week 3: Prompting as Structured Communication**
Core concept: Schema-Guided Reasoning
Exercise: Same task, three prompts (vague → specific → constrained). Compare outputs.

---

## Slide 8: Curriculum — Phase 2

**Title**: Phase 2: Building — "How do I make this do real work?" (Weeks 4–7)

Four cards:

**Week 4: From Chat to Workflow**
Design repeatable AI workflows with defined inputs, steps, verification, and outputs.

**Week 5: Compound AI Systems**
Live demo of the knowledge bot. Peel back the layers: embed → search → rerank → generate.

**Week 6: Build Your First Automation**
Each person picks a workflow from their department. Evaluate through four lenses. Build a v1.

**Week 7: Evaluation and Trust**
Test each other's automations. Build a simple eval: 10 test cases, expected outputs, score results.

---

## Slide 9: Curriculum — Phase 3 & 4

**Title**: Phase 3: Leading (Weeks 8–10) & Phase 4: Handoff (Weeks 11–12)

Two-column layout:

Left column — Phase 3:

- **Week 8**: AI Governance — 12 Essential Questions, assess SPS maturity level
- **Week 9**: Risk & Ethics — HIPAA, bias, transparency obligations, healthcare scenarios
- **Week 10**: Identify Next Automations — impact-effort framework, trainee presentations

Right column — Phase 4:

- **Week 11**: Knowledge Transfer — each trainee writes a one-page "AI Playbook" for their role
- **Week 12**: Final Presentations — trainees present automation projects, intern synthesizes into CEO deck

---

## Slide 10: Pre/Post Assessment

**Title**: Measuring Training Effectiveness

Two-column before/after comparison:

**Pre-Assessment (Week 1)**:

- Can you open a terminal?
- Have you used AI for work?
- Describe what happens when you ask ChatGPT a question
- Identify a problem with this AI output

**Post-Assessment (Week 10)**:

- Design an AI workflow for a department scenario
- Identify 3 risks and mitigations
- What's the difference between a pipeline and an agent?
- When would you use each?

---

## Slide 11: Section Divider — Workstream B

**Workflow Automation**

"Build whatever is needed under the hood. The maintenance surface is no-code."

---

## Slide 12: Design Constraint

**Title**: The No-Code Constraint

Key insight in a callout box:

"Solutions must be maintained by existing employees with no technical background."

Below, two columns:

**What this means:**

- The interface must be simple enough for non-technical users
- It can't break in ways that require a developer to fix
- Documentation and runbooks for every tool

**What this does NOT mean:**

- The intern can't write code
- Solutions must be built with drag-and-drop tools
- Technical depth is a liability

The constraint is on the maintenance surface, not the build.

---

## Slide 13: Automation #1 — Knowledge Bot

**Title**: Internal Knowledge Bot (Teams + RAG Pipeline)

Two-column layout:

Left column — What users see:

- Ask questions in Teams in natural language
- Get answers with citations to specific documents and pages
- Covers HR policies, benefits, SOPs, compliance guidelines
- Copilot Studio front-end (no-code, editable by staff)

Right column — What's under the hood:

- Python RAG API on Azure Container Apps
- 5-stage pipeline: Ingest → Chunk → Embed → Hybrid Search → Generate
- Hybrid search (vector 70% + BM25 30%) outperforms Copilot Studio's built-in grounding
- SQLite-vec database, OpenAI embeddings, Claude Sonnet generation

Bottom: Measurables — questions answered/week, time-to-resolution, accuracy spot-checks

---

## Slide 14: Knowledge Bot Architecture

**Title**: Split Architecture — Why Two Systems

Flow diagram, left to right:

User in Teams → Copilot Studio (no-code, editable by staff) → HTTPS call → Python RAG API (Azure Container Apps) → Answer + Citations

Below the diagram, two callout boxes:

**Front-end (Copilot Studio)**: Greetings, error messages, routing, "I don't know" handling. Staff can edit after internship.

**Back-end (Python API)**: Receives question, returns answer. Black box. Containerized. Restarts automatically.

---

## Slide 15: Knowledge Bot — Production Roadmap

**Title**: 5-Stage → 10-Stage Progression

Table with three columns: Stage | Deployed | Production Value

Deployed (green):

- Ingest + Chunk — Foundation
- Embed + Hybrid Search — Already better than Copilot Studio

Production roadmap (teal):

- Cohere Reranking — ~15–20% precision gain
- HyDE Expansion — Handles vague questions
- Self-RAG Reflection — Knows when it doesn't have a good answer
- RAPTOR Summarization — Cross-document synthesis
- SGR Decomposition — Complex multi-part queries
- LLM-as-Judge Eval — Continuous quality monitoring
- ADI (Document Intel) — Auto-flag contradictions
- Structured Data Layer — Query actual data alongside documents

Bottom note: Full 10-stage pipeline already built in Framework_Build (12.8K LOC, 735 tests, 95.9% accuracy)

---

## Slide 16: Automation #2 — Invoice Processing

**Title**: Invoice / Document Processing

Two-column layout:

Left — The problem:

- Invoices arrive via email and upload in various formats
- Someone manually reads, extracts key fields, enters into spreadsheet/system
- Error-prone, time-consuming, directly impacts Finance team

Right — The solution:

- Power Automate + AI Builder invoice model
- Zero-shot extraction (no training data needed)
- Auto-populates vendor, amount, date, GL code, line items
- Flags duplicates and out-of-threshold amounts for human review
- Industry benchmark: 50–70% reduction in processing time

---

## Slide 17: Additional Automation Candidates

**Title**: Discovery-Dependent Candidates (Weeks 1–3)

Grid of 5 cards:

1. **Meeting Notes → Action Items** — Teams transcript → AI extracts actions, assigns owners, posts to Planner
2. **Recurring Report Generation** — Automate pull-aggregate-format-distribute cycle for monthly/quarterly reports
3. **RFP Response Drafting** — AI pulls from approved past responses, drafts answers, flags sections needing input
4. **Email Triage & Routing** — Shared inboxes classified and routed automatically
5. **Data Quality Monitoring** — Automated checks surface issues before they cascade downstream

Bottom note: Final selections approved by CFO/VP Finance after discovery sessions

---

## Slide 18: Prioritization Framework

**Title**: How We'll Choose

Five criteria in a horizontal bar layout:

- **Frequency** — Daily/weekly beats quarterly
- **Pain Visibility** — If leadership already complains about it, instant buy-in
- **Data Availability** — Can we get sample data in week 1?
- **User Count** — 15 people > 2 people
- **Demo-ability** — The CEO presentation needs a live demo

---

## Slide 19: Section Divider — Workstream C

**Strategic Recommendations**

"Move SPS Health from ad hoc AI usage to embedded organizational capability"

---

## Slide 20: CEO Presentation Structure

**Title**: Final Presentation Outline

Numbered list with brief descriptions:

1. Executive Summary
2. Training Program Results — who trained, skill improvements, materials created
3. Workflow Automation Demos — live demos with before/after comparisons
4. ROI Analysis — quantified time savings, cost avoidance
5. AI Maturity Assessment — where SPS was → where it is now → where it could go
6. Platform Recommendation — Copilot vs. Claude vs. hybrid, with evidence
7. AI Governance Framework — 12 Essential Questions adapted for SPS
8. Roadmap for Continued Investment — next automations, tooling, hiring
9. Knowledge Bot Production Roadmap — 5-stage → 10-stage progression
10. Lessons Learned

---

## Slide 21: Platform Recommendation Framework

**Title**: Copilot vs. Claude for Enterprise

Comparison table:

|          | Copilot                                | Claude for Enterprise              |
| -------- | -------------------------------------- | ---------------------------------- |
| Strength | Deep Microsoft integration             | Better reasoning and analysis      |
| Weakness | Weaker at open-ended analysis          | Fewer Microsoft integrations       |
| Best for | Connecting tools (routing, extraction) | Thinking (analysis, drafting, Q&A) |
| HIPAA    | BAA available                          | No BAA yet                         |

Bottom callout: "The right answer is probably both — Copilot for workflow plumbing, Claude for knowledge work."

---

## Slide 22: AI Maturity Journey

**Title**: SPS Health's AI Maturity Path

Horizontal progression arrow with 5 levels (from TechBetter/Dotan framework):

No Activities → **Ad Hoc Activities** (SPS today, highlighted) → Some Structure → **High Structure** (target) → Adaptive Activities

Below: "Goal: move from ad hoc to some structure by end of internship. Build the foundation for high structure."

---

## Slide 23: Risks & Mitigations

**Title**: Key Risks

Four rows, each with risk and mitigation:

| Risk                           | Mitigation                                                        |
| ------------------------------ | ----------------------------------------------------------------- |
| Azure subscription unavailable | Fall back to Vercel/Railway or simpler Claude Project             |
| Platform decision delayed      | Core curriculum is platform-agnostic by design                    |
| Low employee engagement        | Executive sponsorship + role-specific pain points                 |
| Knowledge bot accuracy issues  | Eval framework built in — golden test set, iterate before rollout |

---

## Slide 24: Open Questions

**Title**: Resolve During Onboarding (Week 1)

Numbered list:

1. Does SPS Health have an Azure subscription?
2. Current state of Claude for Enterprise evaluation?
3. Which departments have the most manual, repetitive workflows?
4. What documents would seed the knowledge bot?
5. Existing Power Automate flows or Copilot Studio bots in use?
6. HIPAA exposure for candidate workflows?
7. Budget for API costs and tooling licenses?
8. Who are the 15–25 training participants?

---

## Slide 25: Closing Slide

**Title**: Ready to Build

Three key takeaways:

- **Week 1**: Discovery sessions + first AI training workshop + pre-assessment
- **Week 6**: Knowledge bot live in Teams + mid-point status update
- **Week 12**: CEO presentation with ROI, governance framework, and forward roadmap

Contact: Dan Swensen
