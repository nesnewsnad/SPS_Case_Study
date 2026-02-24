# AI Implementation Intern — Strategy Design

**Date**: 2026-02-25
**Status**: Draft — pre-discovery, for internal reference
**Context**: SPS Health internship (March–May 2026), reporting to CFO (JC) and VP Finance (Lucas Niemi)

---

## 1. Overview

This document captures the internship strategy across all three workstreams defined in the project scope: AI Training Program (Workstream A), Workflow Automation (Workstream B), and Strategic Recommendations (Workstream C). It synthesizes research on current tooling, maps the OIDD 6670 curriculum to SPS Health's context, and outlines concrete automation candidates.

The goal is to walk into discovery (weeks 1–3) with a mental catalog of patterns, a teaching framework, and a technical architecture — not to prescribe solutions before understanding SPS Health's actual pain points.

---

## 2. Workstream B: Workflow Automation

### 2.1 Design Constraint

The project scope says solutions must be "no-code or low-code, designed to be maintained by existing employees with no technical background." This constrains the **maintenance surface**, not the build. The intern can write code; the people who use and maintain the tool after the internship cannot.

**Implication**: Build whatever is needed under the hood, but the interface must be simple enough that a non-technical person can operate it, and it can't break in ways that require a developer to fix.

### 2.2 Platform Context

- SPS Health is a Microsoft shop (Teams, Outlook, SharePoint, Excel)
- Currently using Microsoft Copilot, evaluating Anthropic Claude for Enterprise
- No confirmed Azure subscription yet (verify during onboarding)

### 2.3 Automation Candidates — Prioritized

#### Tier 1: Deploy in weeks 4–6 (high confidence, proven patterns)

**1. Internal Knowledge Bot (Teams + RAG pipeline)**

An AI-powered Q&A bot in Microsoft Teams grounded in SPS Health's actual documents — HR policies, benefits info, SOPs, compliance guidelines. Employees ask natural-language questions and get answers with citations.

**Architecture (Option C: deploy lite, roadmap full)**

_Deployed version (5-stage pipeline):_

```
User types in Teams
  → Copilot Studio bot receives message (no-code Teams layer)
  → Calls Python RAG API over HTTPS (custom connector)
  → Python API runs 5-stage pipeline:
      1. Ingest (PDF/PPTX/MD → chunks)
      2. Chunk (512 tokens, 2-sentence overlap)
      3. Embed (OpenAI text-embedding-3-large, SQLite cache)
      4. Hybrid search (vector 70% + BM25 30%, RRF merge)
      5. Generate (Claude Sonnet with citations)
  → Returns answer + source citations to Copilot Studio
  → Copilot Studio formats and sends to Teams
```

_Why split architecture (Copilot Studio front-end + Python back-end):_

- The Teams-facing bot (greetings, error messages, routing, "I don't know" handling) lives in Copilot Studio — a no-code tool SPS staff can edit after the internship
- The RAG backend is a black box that receives a question and returns an answer
- If they eventually want to swap the backend (or if Copilot Studio's built-in RAG improves enough), they can do so without rebuilding the Teams experience

_Production roadmap (full 10-stage pipeline from Framework_Build):_

| Stage                 | Deployed | Production | Value                                                      |
| --------------------- | -------- | ---------- | ---------------------------------------------------------- |
| Ingest + Chunk        | Yes      | Yes        | Foundation                                                 |
| Embed + Hybrid Search | Yes      | Yes        | Already better than Copilot Studio's naive vector search   |
| Cohere Reranking      | No       | Yes        | ~15–20% precision improvement on ambiguous queries         |
| HyDE Expansion        | No       | Yes        | Handles vague questions ("tell me about benefits")         |
| Self-RAG Reflection   | No       | Yes        | System knows when it doesn't have a good answer            |
| RAPTOR Summarization  | No       | Yes        | Cross-document synthesis ("summarize all policy changes")  |
| SGR Decomposition     | No       | Yes        | Complex multi-part queries                                 |
| LLM-as-Judge Eval     | No       | Yes        | Continuous quality monitoring without manual QA            |
| ADI (document intel)  | No       | Yes        | Auto-flag when a new policy contradicts existing docs      |
| Structured data layer | No       | Yes        | Query actual data (headcount, budgets) alongside documents |

_Where the code lives:_

- Python FastAPI service packaged as a Docker container
- Deployed to Azure Container Apps (serverless, scales to zero)
- SQLite-vec database on Azure File Share (persistent storage)
- API keys in Azure Key Vault with expiration alerts
- Copilot Studio connects via Custom Connector (HTTPS)

_Maintenance story:_

- Documents: staff add/remove files from a SharePoint folder → triggers ingestion
- Bot personality/routing: edited in Copilot Studio visual editor (no-code)
- Backend: containerized, restarts automatically, health check endpoint
- Runbook: "if the bot stops responding, check these 3 things"

_Measurables:_

- Questions answered per week
- Time-to-resolution vs. emailing HR/department
- User satisfaction (thumbs up/down on answers)
- Accuracy (spot-check sample of answers monthly)

_Reused from Framework_Build:_

- `gsp/chunker.py` — document chunking (512 token, 2-sentence overlap)
- `gsp/embeddings.py` — OpenAI embedding client with dual-tier cache
- `gsp/vectorstore.py` — SQLite-vec + FTS5 hybrid search with RRF merge
- `gsp/ingest.py` — PDF/PPTX/MD ingestion pipeline
- `gsp/config.py` — Pydantic settings management
- Eval framework pattern (golden test set, assertion-based scoring)

**2. Invoice / Document Processing (Power Automate + AI Builder)**

Finance receives invoices via email or upload. AI Builder extracts vendor, amount, date, GL code, line items — auto-populates a spreadsheet or system. Flags duplicates and out-of-threshold amounts for human review.

- Tools: Power Automate + AI Builder invoice model (zero-shot, no training data needed)
- Directly relevant to CFO/VP Finance sponsors
- Industry benchmark: 50–70% reduction in processing time
- Measurables: minutes per invoice before/after, error rate, duplicate catch rate

#### Tier 2: Build in weeks 6–8 (requires discovery to confirm fit)

**3. Meeting Notes → Action Items Pipeline**

- Teams meeting transcript → AI extracts action items, assigns owners, posts to channel/Planner
- Tools: Copilot in Teams (transcription) + Power Automate + Claude/Copilot
- Measurables: % action items captured, follow-through rate

**4. Recurring Report Generation**

- Monthly/quarterly reports built by pulling from multiple sources, formatting, distributing
- Automate the pull-aggregate-format-distribute cycle
- Tools: Power Automate + Excel + scheduled triggers
- Measurables: hours per report cycle before/after

**5. RFP Response Drafting Assistant**

- Incoming RFPs parsed by AI, mapped to library of approved past responses
- Drafts initial answers per section, flags sections needing fresh input
- Tools: Claude Projects with response library as context
- SPS Health is a PBM — they respond to RFPs constantly
- Measurables: hours per RFP draft, consultant cost avoidance

#### Discovery-dependent (identify during weeks 1–3)

**6. Email Triage and Routing** — shared inboxes classified and routed automatically
**7. Status Update Aggregation** — weekly updates collected, normalized, summarized
**8. Employee Onboarding Checklist** — new hire triggers automated task generation
**9. Contract Review Triage** — vendor contracts summarized, deviations flagged
**10. Data Quality Monitoring** — automated checks surface issues before they cascade

### 2.4 Prioritization Framework

Use during discovery to evaluate candidates:

| Criteria          | Why it matters                                                            |
| ----------------- | ------------------------------------------------------------------------- |
| Frequency         | Daily/weekly beats quarterly — more time saved, more visible              |
| Pain visibility   | If leadership already complains about it, instant buy-in                  |
| Data availability | Can you get sample data in week 1, or is it locked behind compliance?     |
| User count        | Automating something 15 people touch beats something 2 people touch       |
| Demo-ability      | The CEO presentation needs a live demo — pick things that look impressive |

### 2.5 Platform Decision Framework

SPS is evaluating Copilot vs. Claude for Enterprise. The honest take:

|          | Copilot                                                                      | Claude for Enterprise                                              |
| -------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Strength | Deep Microsoft integration — Teams, SharePoint, Excel, Power Automate native | Better reasoning, better at complex analysis, more natural writing |
| Weakness | Weaker at open-ended analysis and nuanced writing                            | Fewer native integrations with Microsoft stack                     |
| Best for | Automations that _connect_ tools (routing, extraction, scheduling)           | Automations that _think_ (analysis, drafting, Q&A, summarization)  |
| HIPAA    | BAA available through Microsoft Cloud for Healthcare                         | No BAA for Claude Cowork yet                                       |

The right answer is probably both — Copilot for workflow plumbing, Claude for knowledge work.

---

## 3. Workstream A: AI Training Program

### 3.1 Philosophy

**Goal**: Take employees from zero to "AI-native thinkers" — people who can look at any workflow, identify where AI fits, scope a solution, and either build it or write a brief for someone who can.

**Approach**: Bottom-up foundation, then problem-first application. Terminal-native from day one — learn the environment by using AI inside it, not as a separate step.

**Platform**: Platform-agnostic core curriculum. Work in the terminal with Claude Code or equivalent. Specific tool modules added once SPS Health's platform decision is finalized.

### 3.2 Theoretical Framework (adapted from OIDD 6670)

Six core concepts from Wharton's "AI, Business, and Society" course anchor the curriculum:

**1. LLMs as Approximate Retrievers** (Meursault, S02)
LLMs don't "know" things — they pattern-match against training data and return an approximate retrieval. This explains hallucination (similar patterns, wrong retrieval), inconsistency (similar prompts, different results), and opacity (can't see what training data influenced the output). This is the foundational mental model. Teach in week 1, reference constantly.

**2. The Jagged Frontier** (Meursault, S05)
AI capabilities are uneven. It can write a flawless email but can't reliably add three numbers. The boundary between "AI is great at this" and "AI will fail here" isn't a clean line — it's jagged, and it shifts as models improve. This framework prevents both over-trust and dismissal.

**3. Compound AI Systems / "Stone Soup"** (Meursault, S05; BAIR 2024)
An LLM alone is a gourmet ingredient, not the whole meal. Real AI solutions combine LLMs with data sources, tools, and human input. Key distinction: **pipeline** (predefined steps, hard-coded logic) vs. **agent** (LLM chooses next step). Most business automations should be pipelines, not agents.

**4. The Four Perspectives** (Meursault, S01)
Every AI decision should be evaluated through four lenses:

- **Engineer**: How do I improve the output?
- **Manager**: How do I organize the process?
- **Strategist**: What opportunity does this address?
- **Citizen**: What are the broader impacts?

**5. From Ad Hoc to Glass-Box Workflows** (Meursault, S05)
The maturity progression: copy-paste between work files and a chat window (ad hoc) → integrated workflows where AI operates directly on your files (glass-box). This is why the terminal matters — it closes the gap between "where my work lives" and "where the AI lives."

**6. The 12 Essential Questions for AI Governance** (Dotan, TechBetter)
Four pillars: Discovery (what is this AI doing and why?), Measurement (how do we evaluate risks?), Mitigation (how do we reduce negative impacts?), Accountability (who is responsible?). Framework for Workstream C and for teaching responsible AI adoption.

### 3.3 Curriculum

#### Phase 1: Foundations — "What is this thing?" (Weeks 1–3)

**Week 1: Terminal + First AI Interaction**

- Core concept: LLMs as Approximate Retrievers
- Open a terminal. `ls`, `cd`, `pwd` — navigate to a folder with real work files
- Install and run an AI tool in the terminal
- First exercise: point AI at a real file (spreadsheet, policy doc). Ask it a question. See it answer.
- Second exercise: ask it something it can't know. Watch it hallucinate. "Now you understand what this is."
- Terminal concepts taught in context: "We need to `cd` here because that's where your reports live"

**Week 2: Reading, Writing, Editing with AI**

- Core concept: The Jagged Frontier
- AI as a collaborator on real files: draft an email, summarize a report, reformat messy data
- Everything in the terminal on their actual work files — not in a disconnected chat window
- Exercise: take a recurring task from their job. Do it with AI. Find where it's great, find where it fails. Map their own personal jagged frontier.
- Mental models woven in as encountered: context windows (why it lost track), temperature (why different answers), tokens (why it costs money)

**Week 3: Prompting as Structured Communication**

- Core concept: Schema-Guided Reasoning (lite)
- Framework: Role → Context → Task → Format → Constraints
- Same task, three prompts: vague, specific, schema-constrained. Compare outputs.
- Exercise: intentionally break AI. Find failure modes. This builds more trust than success does — now they know the boundaries.

#### Phase 2: Building — "How do I make this do real work?" (Weeks 4–7)

**Week 4: From Chat to Workflow**

- Core concept: Ad Hoc → Glass-Box
- Identify a recurring task. Design a repeatable AI workflow: defined inputs, processing steps, verification, outputs.
- Not "open a chat and ask" — a structured, reproducible process.

**Week 5: Compound AI Systems**

- Core concept: Stone Soup / Pipeline vs. Agent
- Live demo: show the knowledge bot. Peel back the layers — "when you asked that question, here's what actually happened: embed → search → rerank → generate."
- They see that the AI is one ingredient in a system. This is the "aperture opening" moment.

**Week 6: Building Your First Automation**

- Core concept: Four Perspectives (applied)
- Each person picks a workflow from their department
- Evaluate through all four lenses: Engineer (what's the AI doing?), Manager (who owns this?), Strategist (what's the ROI?), Citizen (what could go wrong?)
- Build a v1 using available tools (Claude Projects, Power Automate, Copilot Studio — whatever fits)

**Week 7: Evaluation and Trust**

- Core concept: HELM / "never evaluate on training data"
- Test each other's automations. Find failure modes.
- Build a simple eval: 10 test cases, expected outputs, score the AI's actual outputs
- Key lesson: "this is how you know if it works — not vibes, measurement"

#### Phase 3: Leading — "How do I think about this for the organization?" (Weeks 8–10)

**Week 8: AI Governance for SPS Health**

- Core concept: 12 Essential Questions + Maturity Levels
- Walk through Dotan's framework. Assess SPS Health's current maturity level.
- Likely position: "Ad hoc activities" → goal is "Some Structure" by end of internship.

**Week 9: Risk, Ethics, and Healthcare-Specific Concerns**

- HIPAA implications for AI tools processing health data
- Bias in AI-assisted decisions (formulary recommendations, claims processing)
- Transparency obligations — when must you disclose AI involvement?
- Real scenarios grounded in SPS Health's domain

**Week 10: Identifying the Next Automation**

- Impact-effort framework + Four Perspectives
- Each trainee identifies 2–3 automation opportunities in their department
- Evaluates through the four lenses, sizes on impact-effort matrix
- Presents to the group — this feeds directly into Workstream C

#### Phase 4: Handoff (Weeks 11–12)

**Week 11: Knowledge Transfer + Documentation**

- Each trainee writes a one-page "AI Playbook" for their role
- Contents: what they automated, how to maintain it, where AI helps most, where to be careful
- These become the self-serve resource library deliverable

**Week 12: Final Presentations**

- Trainees present their automation projects to the group
- Intern synthesizes findings into the CEO deck (Workstream C)
- Celebration + what's next

### 3.4 Deliverables (per project scope)

| Deliverable                   | How it's produced                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| AI Training Curriculum        | This document (sections 3.2–3.3) formalized into a syllabus                                                    |
| Workshop Materials            | Slide decks + hands-on exercises developed weekly during Phase 1–2                                             |
| Self-Serve Resource Library   | Prompt templates, how-to guides, video walkthroughs created during sessions; trainee AI Playbooks from week 11 |
| Coaching Log                  | 1:1 session records maintained throughout (topics, follow-ups)                                                 |
| Training Effectiveness Report | Pre-assessment (week 1) vs. post-assessment (week 10) comparison + participant feedback                        |

### 3.5 Pre/Post Assessment Design

**Pre-assessment (week 1):**

- Can you open a terminal? (Y/N)
- Have you used an AI chatbot for work? (Never / Occasionally / Regularly)
- Describe what happens when you ask ChatGPT a question (open-ended — tests mental model)
- Given this prompt and output, identify one problem with the AI's answer (tests critical evaluation)

**Post-assessment (week 10):**

- Same questions as pre-assessment, plus:
- Design an AI workflow for [scenario relevant to their department] — include inputs, AI steps, verification, and output
- Identify 3 risks of deploying this workflow and how you'd mitigate each
- What's the difference between a pipeline and an agent? When would you use each?

---

## 4. Workstream C: Strategic Recommendations

### 4.1 Structure

The final CEO presentation synthesizes all work. Outline:

1. **Executive Summary** — objectives, scope, timeline, headline results
2. **Training Program Results** — who was trained, skill improvement metrics, materials created
3. **Workflow Automation Demos** — live demos of deployed tools, before/after comparisons
4. **ROI Analysis** — quantified time savings, cost avoidance, productivity gains
5. **AI Maturity Assessment** — where SPS Health was (ad hoc), where it is now (some structure), where it could go (high structure / adaptive)
6. **Platform Recommendation** — Copilot vs. Claude vs. hybrid, with evidence from the internship
7. **AI Governance Framework** — adapted 12 Essential Questions for SPS Health's context
8. **Roadmap for Continued Investment** — additional automation opportunities (from trainee week 10 presentations), tooling/licensing recommendations, suggested next hires or resource allocation
9. **Knowledge Bot Production Roadmap** — the 5-stage → 10-stage progression, estimated lift (~2–3 days parallelized per stage), what each stage buys
10. **Lessons Learned** — what worked, what didn't, what to do differently

### 4.2 Key Artifacts to Reference

- SPS Case Study dashboard (live URL) — demonstrates full-stack AI-assisted development
- Framework_Build RAG pipeline — demonstrates production-grade retrieval architecture
- Architecture diagram (sps-architecture.excalidraw) — "System Building, Not Vibe Coding"
- Trainee AI Playbooks — evidence of organizational capability building

---

## 5. Timeline Alignment

| Week | Phase     | Training                        | Automation                                 | Strategic                          |
| ---- | --------- | ------------------------------- | ------------------------------------------ | ---------------------------------- |
| 1    | Discovery | Pre-assessment, Week 1 session  | Discovery sessions with dept leaders       | —                                  |
| 2    | Discovery | Week 2 session                  | Workflow shortlist (5–7 candidates)        | —                                  |
| 3    | Discovery | Week 3 session                  | CFO/VP approve workflow selections         | Draft maturity assessment          |
| 4    | Build     | Week 4 session                  | Knowledge bot: ingest docs, build pipeline | —                                  |
| 5    | Build     | Week 5 session (demo bot)       | Knowledge bot: deploy to Teams             | —                                  |
| 6    | Build     | Week 6 session                  | Automation #2: build v1                    | Mid-point status update            |
| 7    | Build     | Week 7 session (eval)           | Automation #2: test + iterate              | —                                  |
| 8    | Build     | Week 8 session (governance)     | Automation #3: build v1 (if scoped)        | Begin governance framework         |
| 9    | Build     | Week 9 session (ethics)         | Automation #3: test + iterate              | Platform recommendation draft      |
| 10   | Measure   | Week 10 session (presentations) | Impact metrics compiled                    | ROI analysis                       |
| 11   | Measure   | Week 11 (knowledge transfer)    | Documentation finalized                    | CEO deck draft                     |
| 12   | Present   | Week 12 (final presentations)   | Handoff complete                           | Final presentation to Chairman/CEO |

---

## 6. Risks

| Risk                                              | Impact                                 | Mitigation                                                                                                                         |
| ------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Azure subscription not available                  | Can't deploy knowledge bot backend     | Fall back to Vercel/Railway; or deploy as a simpler Claude Project + Copilot Studio without custom backend                         |
| Platform decision delayed (Copilot vs. Claude)    | Training content may need rework       | Core curriculum is platform-agnostic by design; tool-specific modules are add-ons                                                  |
| Low employee engagement                           | Reduced adoption and ROI               | Secure visible executive sponsorship (CFO/VP are sponsors); tailor to role-specific pain points; keep sessions short and practical |
| Discovery reveals no strong automation candidates | Can't deliver 2–3 workflows            | 10 candidates pre-identified in section 2.3; knowledge bot is platform-independent and universally useful                          |
| Knowledge bot accuracy insufficient               | Users lose trust                       | Eval framework built in (golden test set pattern from Framework_Build); iterate on retrieval quality before broad rollout          |
| Anthropic API costs exceed budget                 | Knowledge bot becomes expensive to run | Monitor per-query costs; use Haiku for simple queries, Sonnet for complex; implement caching; fall back to Copilot if needed       |

---

## 7. Open Questions (resolve during onboarding)

1. Does SPS Health have an Azure subscription? (Determines deployment target)
2. What's the current state of the Claude for Enterprise evaluation?
3. Which departments have the most manual, repetitive workflows? (Discovery priority)
4. What documents would seed the knowledge bot? (HR policies, SOPs, benefits guides)
5. Are there existing Power Automate flows or Copilot Studio bots in use?
6. What's the HIPAA exposure for the workflows we'd automate? (PHI vs. non-PHI)
7. What's the budget for API costs / tooling licenses?
8. Who are the 15–25 training participants? What's the range of technical comfort?
