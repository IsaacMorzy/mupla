# STATE.md — current pass progress

**Read at the start of every pass; overwrite at the end.**
This file is the only one in the repo whose history is reset per pass. For
historical accuracy, see `loop-run-log.md`.

Last updated: **2026-07-06** by the bootstrap pass (pass 0).

## Pass status

| Slot          | Value                                                      |
| ------------- | ---------------------------------------------------------- |
| Pass id       | `0` (bootstrap)                                            |
| Pattern       | `daily-triage`                                             |
| Started       | 2026-07-06 — first time the loop runs in this repo.          |
| Operator      | Codebuff agent (install + bootstrap session)                |
| Goal          | Scaffold daily-triage infrastructure; reconcile roadmap against `gh`. |

## Loop readiness progression

| Pass | Date       | Score          | Notes                                          |
| ---- | ---------- | -------------- | ---------------------------------------------- |
| 0    | 2026-07-06 | 25/100 (L0) → TBD | Scaffold lands; pass 0.5 will measure after. |

## Open issues (`gh issue list --state open`, limit 30)

| #  | Title                                                       | Real labels now                             | Recommendation                                                                |
| -- | ----------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------- |
| 3  | TinaCMS schema mismatch blocks production deploys           | `bug`, `ready-for-human`, `ready-for-agent` | Drop `ready-for-agent` (agent work is on disk); keep `ready-for-human` (push gate); keep `bug`. **Human-pasted.** |
| 7  | Modernize blog + token-violation sweep (DESIGN.md §6/§7)    | `enhancement`, `ready-for-human`, `ready-for-agent` | Drop `ready-for-agent` (shipped); keep `ready-for-human` (push gate); keep `enhancement`. **Human-pasted.** |

Both issues carry **two triage roles simultaneously**, which the
state-machine diagram in `docs/agents/triage-labels.md` does not allow.
Surface in the daily report.

## Roadmap ↔ GitHub drift

`docs/agents/redesign-roadmap.md` §3 lists seven open issues (`#1, #2, #3,
#6, #7, #8`). `gh` shows only two are open (`#3, #7`). The other four have
been closed out-of-band since that doc was last updated. Documented in
`docs/agents/redesign-roadmap.md` §3.1 and `docs/agents/triage-report-2026-07-06.md`.

## Human gates this pass

None yet on the local repo. The two `gh issue edit --remove-label`
commands in the triage report are pasted-only by the maintainer.

## Next pass (0.5 → 1)

1. Run `loop-audit . --json` after this scaffold lands. Record in
   `loop-run-log.md`.
2. Run `loop-sync . --dry-run -v` after scaffold. Confirm drift cleared.
3. Re-list `gh issue list --state open`; if the maintainer has applied
   the snippet commands, expect both issues to drop one role.
4. Run `loop-cost --pattern daily-triage --level L1 --json` to record
   the per-pass cost estimate in `loop-run-log.md`.
