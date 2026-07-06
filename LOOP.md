# LOOP.md — daily-triage cadence for mupla-front

This file is the source of truth for the **daily-triage** loop installed on this
repo. Every pass reads this file before doing anything. Companion files in
the same tree:

- `STATE.md` — current pass progress (overwritten per pass).
- `loop-budget.md` — per-pass token / time / `gh`-op caps.
- `loop-constraints.md` — denylist on paths and ops the agent must not touch.
- `docs/safety.md` — human-gate definitions for `git push`, `gh issue close`.
- `loop-run-log.md` — append-only history, one section per pass.
- `patterns/registry.yaml` — machine-readable index of available loop
  patterns (`@cobusgreyling/loop-init --list`).

## Pattern: daily-triage

Pattern bundle: `@cobusgreyling/loop-init --pattern daily-triage`.
Lifted from the loop-engineering CLI suite and adapted for the Matt Pocock
triage state machine that already exists in `docs/agents/triage-labels.md`.

| Slot            | Value                                            |
| --------------- | ------------------------------------------------ |
| Cadence         | 1 pass per day                                    |
| Window          | 1 h – 2 h                                         |
| Level           | L1 — informational pass, never auto-merges anything |
| Owner (gate)    | `@IsaacMorzy` (the repo's main collaborator)        |
| Executor        | any local agent with `gh` auth + loop CLIs on PATH |
| Trigger         | night cron, or manual re-run                       |
| Burn rate       | low — see `loop-cost --pattern daily-triage`       |

## Pass sequence (deterministic — order matters)

> **Pass 0 (bootstrap) is the exception.** The first-ever pass in a new
> repo writes the scaffolding files *before* checking drift or scoring,
> because the audit will mark the absence of those files as the failure
> being fixed. Every subsequent pass follows the order below.

1. **Read-only refresh from GitHub.**
   - `gh issue list --repo IsaacMorzy/mupla --state open --json <fields>`
   - `gh issue list --repo IsaacMorzy/mupla --state all --limit 50 --json <fields>`
   - `gh label list --repo IsaacMorzy/mupla --json name,color,description`
2. **Drift check before scoring.** `loop-sync . --dry-run -v`. Fix drift
   *before* running the readiness audit, or the audit will mis-report.
3. **Readiness score.** `loop-audit . --json`. The score (and the per-finding
   list via `loop-audit . --suggest`) goes into the next two entries of
   `loop-run-log.md`.
4. **Read the roadmap.** `docs/agents/redesign-roadmap.md` is the source of
   truth for "where are we?"; the pass reconciles it against the current
   GitHub state and updates §3.1 with deltas.
5. **For every open issue**, apply the five-label state machine from
   `docs/agents/triage-labels.md`:
   - **Stay in current label** unless explicitly moved.
   - If the issue is **shipped and tracker-stale** → propose `wontfix` +
     human-passed `gh issue close`.
   - If **duplicate** → `wontfix`.
   - If **waiting on reporter** → `needs-info`.
   - **Never apply `remove-label` automatically** (`docs/safety.md`).
6. **Write the per-pass report** as `docs/agents/triage-report-YYYY-MM-DD.md`.
   The report's `## Human-pasted commands` block is the only place `gh issue
   edit` / `gh issue close` lines live, and the agent **does not execute
   them** — the maintainer pastes them at a creds-loaded terminal.
7. **Append the pass to `loop-run-log.md`.** Never edit historical entries.
8. **Re-run `loop-audit . --json`** to record the *after* score in
   `loop-run-log.md` and `STATE.md`.

## Human gates (zero agent authority)

Per `docs/safety.md`, these ops are NEVER executed by the agent, even with
explicit per-pass override:

| Op                                     | Why it's gated                                                |
| -------------------------------------- | -------------------------------------------------------------- |
| `git push origin *`                    | TinaCloud rebuilds the schema on push; broken pushes can take the live site offline. |
| `gh issue close *`                     | Closes regress invisibly; re-open is the only undo.            |
| `gh issue edit --remove-label *`       | Removes triage intent; add-label reversal is asymmetric.       |
| `vercel deploy --prod`                 | Vercel prod is wired to the TinaCloud push hook — that *is* the gate. |

The agent **may** run:

- `gh issue list` / `view` / `search` (read)
- `gh pr list` / `view` (read)
- `gh label list` (read)
- `gh issue edit --add-label <label>` (additive; see `docs/safety.md`)

## Kill switch

If a pass drifts from this file (wrong pattern, off-cadence, attempting a
gated op, or `loop-audit` regressing for two consecutive passes without a
human-reviewed fix):

1. Abort the pass; mark `STATE.md` as `ABORTED — see loop-run-log.md`.
2. Append an entry to `loop-run-log.md` with `Status: ABORTED`.
3. Halt the loop until a human reviews.

## See also

- `STATE.md` — current-pass progress.
- `loop-budget.md` — token / time / ops caps.
- `loop-constraints.md` — denylist on paths and ops.
- `docs/safety.md` — human-gate policy.
- `loop-run-log.md` — per-pass audit trail.
- `patterns/registry.yaml` — registered patterns (machine-readable).
- `docs/agents/redesign-roadmap.md` §3.1 — per-pass deltas.
- `docs/agents/triage-report-*.md` — per-pass triage reports (one per pass).
