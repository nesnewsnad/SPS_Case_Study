# Workflow — SPS Health Case Study

## Artifact Chain

```
Case Study PDF (immutable intent)
  └→ CLAUDE.md (architecture & context)
       └→ Session Logs (daily record)
            └→ TODO.md (live task queue)
                 └→ Discuss (lock design decisions)
                      └→ Research (investigate before planning)
                           └→ Specs (behavior contracts)
                                └→ Implementation
                                     └→ Verify (goal-backward)
```

## Artifact Ownership

| Artifact | Owner | Mutability |
|---|---|---|
| Case Study PDF | External (SPS Health) | Immutable |
| CLAUDE.md | Mac | Evolves with architecture |
| Session Logs | Mac | Append-only |
| TODO.md | Mac adds/prioritizes, Framework checks off | Live |
| CONTEXT docs | Mac (from /discuss) | Locked per-spec |
| Specs | Mac writes, Framework implements | Append-only amendments |
| Implementation | Framework | Active |
| Verification reports | Mac (separate session from writer) | Append-only |

## Session Discipline

1. Start every session with `/open-session`
2. One spec per session
3. Use `/continue-here` for mid-spec checkpoints or long context
4. End every session with `/close-session`

## Spec Lifecycle

1. **Discuss** (`/discuss`) — identify gray areas, lock decisions into CONTEXT doc
2. **Research** (`/research`) — investigate data patterns, tools, best practices
3. **Spec Check** (`/spec-check NNN`) — pre-implementation readiness audit
4. **Implement** — write code + tests against spec ACs
5. **Verify** (`/verify NNN`) — goal-backward verification in separate session

## Verification Methodology (Enhanced from GSD)

Three-level goal-backward verification:
1. **Exists** — does the artifact/feature exist at all?
2. **Substantive** — is it real implementation, not a stub/placeholder?
3. **Wired** — is it connected to the rest of the system and functional?

Start from "what must be TRUE" and work backwards, not from task completion.

## Dual Machine Coordination

- **Git** is the coordination layer
- Mac pushes: specs, designs, session logs, TODO priorities
- Framework pushes: implementation commits
- Framework's commits are source of truth for code
- Mac's session logs are source of truth for project history
- Writer/reviewer separation: whoever implemented does NOT run `/verify`

## Flow Rules

- No implementation without a spec
- No spec without a TODO item
- No TODO item without context (from session logs, CLAUDE.md, or /discuss)
- Session logs are append-only
- CLAUDE.md reflects current state
- Case Study PDF is the immutable intent (the "PDR")
