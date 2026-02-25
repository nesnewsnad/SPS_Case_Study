Lightweight research phase — investigate before writing a spec. Usage: /project:research or /project:research SPEC-NNN

Run AFTER /project:discuss and BEFORE writing the spec.

Read the TODO item, CONTEXT doc (from discuss), and CLAUDE.md. Identify research questions in three categories:
- **Data questions** (answer from actual data): distributions, cardinalities, edge cases, merged dataset shape
- **Technical questions** (answer from docs/web): Chart.js capabilities, performance, browser compatibility
- **Domain questions** (answer from industry knowledge): LTC pharmacy KPIs, normal reversal rates, what analysts want to see

For each question: state it, show evidence, state the finding, rate confidence (HIGH = verified from data/docs, MEDIUM = reasonable inference, LOW = educated guess).

Save to `docs/specs/SPEC-NNN-research.md` with: Questions Investigated, Findings (with confidence), Implications for Spec, Open Questions. Commit with message "research: findings for SPEC-NNN".

Evidence over opinion. Data questions answered from data, not guessed. Claude's training data is hypothesis, not fact.

$ARGUMENTS
