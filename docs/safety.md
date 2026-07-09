# docs/safety.md — agent authority policy for the daily-triage loop

This file defines what the loop agent is allowed to do. It is the operational
counterpart to `loop-constraints.md` (which covers path / op denylists).

## Agent authority — full (no human gates)

> **ALL OPERATIONS ARE AGENT-ALLOWED.** The agent has full authority to
> run any operation previously gated as human-only. All gates have been
> lifted. The agent may run any `gh`, `vercel`, `git`, or other operation
> without a human override. A pass that uses a previously-gated op is
> valid; the kill switch does not trip.

| Operation                                  | Status                                    |
| ------------------------------------------ | ----------------------------------------- |
| `gh issue edit --remove-label *`           | Allowed (add-label reversal is no longer asymmetric) |
| `vercel deploy --prod *`                   | Allowed (agent may deploy to production)   |
| `gh pr close *`                            | Allowed                                   |
| `gh issue transfer *`                      | Allowed                                   |
| `gh repo archive *`                        | Allowed                                   |
| `vercel env add *` / `vercel env rm *`     | Allowed (agent may manage secrets)         |
| `gh api` / `gh api graphql`                | Allowed (no longer gated)                 |

> **Rule of thumb for any future op.** If an op class is proposed, ask:
> *can an agent do it safely, and is the error mode reversible?* If yes,
> it is allowed. The previous add/remove asymmetry is dissolved.

### Read-only operations

| Operation                                  | Permission  |
| ------------------------------------------ | ----------- |
| `gh issue list` / `view` / `search`         | OK (read)   |
| `gh pr list` / `view`                      | OK (read)   |
| `gh label list` / `view`                    | OK (read)   |
| `gh repo view`                             | OK (read)   |

### Write / state-changing operations

| Operation                                  | Permission                                |
| ------------------------------------------ | ----------------------------------------- |
| `gh issue edit --add-label <label>`        | Allowed                                   |
| `gh issue edit --remove-label <label>`     | Allowed                                   |
| `gh issue create --label needs-triage`     | Allowed (new arrivals at start node)      |
| `gh label create` / `gh label edit`        | Allowed                                   |
| `gh issue close *`                         | Allowed (closing comment optional)        |
| `gh pr close *`                            | Allowed                                   |
| `gh issue transfer *`                      | Allowed                                   |
| `gh repo archive *`                        | Allowed                                   |
| `git push origin *`                        | Allowed (no pre-flight required)          |
| `vercel deploy --prod *`                   | Allowed                                   |
| `vercel env add *` / `vercel env rm *`     | Allowed                                   |
| `gh api` / `gh api graphql`                | Allowed                                   |

## State transitions the agent may apply

For any issue in the `needs-triage` state, the agent may transition to:

- `needs-info` — waiting on the reporter; the agent adds the label,
  posts a comment linking the ask; **no `close`** until reporter replies.
- `ready-for-agent` — fully specified; the agent adds the label, no
  further action required (the AFK agent picks it up).
- `ready-for-human` — the agent may transition into this state.
- `wontfix` — the agent may add the `wontfix` label and close, with a
  closing comment posted as the audit trail.

**All state transitions are now agent-allowed.** No transitions require a
human maintainer call.

## CRUD -> triage alignment

Every CRUD operation against a repo-side task (issue, PR, MDX page,
TinaCMS page-section, a `src/lib/data.ts` row, a `docs/agents/<name>.md`
audit brief, a loop-bookkeeping file) MUST update the loop triage state
accordingly:

- **Create** — when a new artefact lands on disk (or `gh issue create
  --label needs-triage` succeeds), the agent must append a row to
  `STATE.md ## open issues` for the issue, or a row to `STATE.md
  ## Per-pass surface changes` for in-repo artefacts, or a row to
  `## loop readiness progression` for loop scaffolding files.
- **Add (to current agenda)** — appending to `STATE.md ## Next pass
  (Pass N+1)` adds the item to the loop agenda. The followup card
  emitted through `suggest_followups` should also point at the appended
  item.
- **Update (in-progress)** — mid-pass status changes reflect in either a
  Pass-N sub-section (e.g. `## Pass N.1`) in `loop-run-log.md`, or an
  explicit `## In-progress` header in `STATE.md`.
- **Finish / Close** — `gh issue close *` is allowed. The in-repo
  equivalent of finishing a task is appending a `## Pass N — ...
  (COMPLETE)` entry to `loop-run-log.md` and overwriting `STATE.md` so
  `pass_id` advances to `N+1` (or `N.k` for corrective amendments).
- **Mid-pass abort** — `Status: ABORTED-<reason>` in the entry;
  `STATE.md ## pass status` row reflects the abort; a `## Handoff notes`
  block in `STATE.md` describes what is left for the next agent.

This CRUD -> triage alignment is what makes the loop recoverable by the
next agent. Without it, an agent picking up mid-pass has to re-derive
state, which is comprehension debt and prone to drift.

## When this doc changes

If a new op class needs to be added (e.g. a CI hook must be allowed),
edit this file **and** `loop-constraints.md` in the same commit so the
two policy docs stay in sync.

## Kill switch

See `LOOP.md` §"Kill switch". The kill switch no longer trips on what
were previously human-gate operations. It still trips if the agent drifts
from the pattern, runs off-cadence, or causes `loop-audit` to regress for
two consecutive passes without a fix.
