# docs/safety.md — human-gate policy for the daily-triage loop

This file defines what the loop agent can **never** do and what it is
allowed to do under additive-only semantics. It is the operational counterpart
to `loop-constraints.md` (which covers path / op denylists).

## Hard human gates — zero agent authority

| Operation                                  | Why it's gated                                                                |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| `gh pr close *`                            | PR closes are rarer and more consequential; we gate them separately.           |
| `gh issue edit --remove-label *`           | Removing a triage role erases intent. Re-applying has a different audit log.   |
| `vercel deploy --prod *`                   | Vercel prod is wired to the TinaCloud push hook; that hook **is** the gate.   |
| `gh issue transfer *`                      | Moves ownership to another repo / org without the maintainer's view.         |
| `gh repo archive *`                        | Freeze the repo (reversible through settings, but a surprising UX).         |
| `vercel env add *` / `vercel env rm *`     | Writes / deletes production env vars; equivalent to secret rotation.        |

> **Wide-shot escape hatch.** `gh api` / `gh api graphql` are
> unconstrained but can call any of the verbs above; treat them as a
> hard gate too. If a pass needs `gh api`, the maintainer signs an
> override (`loop-constraints.md`).
>
> **Closes are conditionally auto-applied.** For `gh issue close *`, the agent
> may close issues that are in `wontfix` state with a closing comment
> (audit trail) posted in the same op window. PR closes (`gh pr close *`)
> remain human-only. Re-open remains trivial for both.

If a pass attempts any of these, it must abort immediately and append a
`loop-run-log.md` entry tagged `Status: ABORTED — gate attempted: <op>`.

## Soft authority — read-only by default

| Operation                                  | Permission                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| `gh issue list` / `view` / `search`         | OK (read)                                                                    |
| `gh pr list` / `view`                      | OK (read)                                                                    |
| `gh label list` / `view`                    | OK (read)                                                                    |
| `gh repo view`                             | OK (read)                                                                    |
| `loop-audit`, `loop-sync`, `loop-cost`, `loop-init --dry-run` | OK (read)                                |

## Additive operations — allowed under safety.md

| Operation                                  | Permission (with rationale)                                                |
| ------------------------------------------ | -------------------------------------------------------------------------- |
| `gh issue edit --add-label <label>`        | Adds a triage role; reversible by removing (which is the human-only gate).  |
| `gh issue create --label needs-triage`     | New arrivals land at the start node of the state machine.                   |
| `gh label create` / `gh label edit`        | Idempotent; needed when labels missing or colors drift.                     |
| `git push origin *`                        | Allowed under Vercel auto-deploy. **Pre-flight:** `pnpm exec astro check` must be 0 errors; a `loop-run-log.md` Pass-N entry documenting the push must be staged in the same commit. |
| `gh issue close *`                         | Allowed as the loop's close-out path. **Pre-flight:** a closing comment (audit trail) must be posted in the same op window. Re-open remains trivial. |

The asymmetry has narrowed: **add is safe**, **remove-label is still
human-only**, **`gh issue close` is allowed under pre-flight rules**,
and **`gh pr close` is still human-only**. The remaining human-only
gates (`remove-label`, `pr close`, `vercel env add/rm`, `gh issue
transfer`, `gh repo archive`) preserve the safety property for ops that
cannot be cheaply reversed.

## State transitions the agent may apply

For any issue in the `needs-triage` state, the agent may transition to:

- `needs-info` — waiting on the reporter; the agent adds the label,
  posts a comment linking the ask; **no `close`** until reporter replies.
- `ready-for-agent` — fully specified; the agent adds the label, no
  further action required (the AFK agent picks it up).

The agent must NEVER transition issues itself into:

- `ready-for-human` — this is a maintainer call. The agent can *recommend*
  via the triage report; the maintainer pastes the add-label command.

The agent **may** transition into `wontfix` under the pre-flight rule for
`gh issue close *` in the additive table above: the agent may add the
`wontfix` label and close in the same op window, with a closing comment
posted as the audit trail. Outside that op window, `wontfix` remains a
maintainer call.

## CRUD -> triage alignment (Pass 10)

Every CRUD operation against a repo-side task (issue, PR, MDX page, TinaCMS page-section, a `src/lib/data.ts` row, a `docs/agents/<name>.md` audit brief, a loop-bookkeeping file) MUST update the loop triage state accordingly:

- **Create** — when a new artefact lands on disk (or `gh issue create --label needs-triage` succeeds), the agent must append a row to `STATE.md ## open issues` for the issue, or a row to `STATE.md ## Per-pass surface changes` for in-repo artefacts, or a row to `## loop readiness progression` for loop scaffolding files.
- **Add (to current agenda)** — appending to `STATE.md ## Next pass (Pass N+1)` adds the item to the loop agenda. The followup card emitted through `suggest_followups` should also point at the appended item.
- **Update (in-progress)** — mid-pass status changes reflect in either a Pass-N sub-section (e.g. `## Pass N.1`) in `loop-run-log.md`, or an explicit `## In-progress` header in `STATE.md`.
- **Finish / Close** — `gh issue close *` is allowed under the pre-flight rules in the additive table above. The in-repo equivalent of finishing a task is appending a `## Pass N — ... (COMPLETE)` entry to `loop-run-log.md` and overwriting `STATE.md` so `pass_id` advances to `N+1` (or `N.k` for corrective amendments).
- **Mid-pass abort** — `Status: ABORTED-<reason>` in the entry; `STATE.md ## pass status` row reflects the abort; a `## Handoff notes` block in `STATE.md` describes what is left for the next agent.

This CRUD -> triage alignment is what makes the loop recoverable by the next agent. Without it, an agent picking up mid-pass has to re-derive state, which is comprehension debt and prone to drift.

## When this doc changes

If a new op class needs to be added (e.g. a CI hook must be allowed), edit
this file **and** `loop-constraints.md` in the same commit so the two
policy docs stay in sync.

## Kill switch

See `LOOP.md` §"Kill switch". Any violation of the hard gates above trips
the kill switch automatically.
