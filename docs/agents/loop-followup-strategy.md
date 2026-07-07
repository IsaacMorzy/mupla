# Loop follow-up strategy

The `daily-triage` loop emits three `suggest_followups` cards on close-out.
This document is the meta-rule for what happens to those cards in the next
session: they are **Pass N+1 candidates**, not just developer reminders.

## Why this exists

Without a written rule, the gap between "I suggested three followups" and
"the next session executed them" is undefined. Long-term, that gap is
where loops die: the maintenance cost of remembering what to do next is
larger than the cost of running the next pass.

The rule on this page closes the gap by treating every emitted card as:

1. Subject to the `prompt-engineering` four-pillar check.
2. Sequenced into the loop's `Pass N+1` slot.
3. Dispatched to the *matt-pocock* workflow family for execution.
4. Logged to `loop-run-log.md` as a fresh entry (no amend).
5. Committed locally under a stable SHA. Push is the maintainer's call.

## The close-out bump

When the assistant uses `suggest_followups` at end-of-turn, the three
cards become the **Pass N+1 backlog** for the next session. The next
session starts by reading the most recent `## Pass N` entry of
`loop-run-log.md` and the three cards beside it as seeded Pass N+1
work items.

### Card contract (apply on every card before emitting)

A card must satisfy all four: lead with a verb, reference Pass N+1,
surface a path-shaped token, ≤ 200 chars. The `prompt-engineering`
skill owns this contract — installed at
`~/.agents/skills/prompt-engineering/SKILL.md` and mirrored to
`~/.codebuff/skills/prompt-engineering` and
`~/.pi/skills/prompt-engineering`. Its bundled
`scripts/verify-card.sh` is the **canonical implementation**; the
recipe below is the model-visible mirror, both must stay in lockstep:

```bash
# model-visible mirror of scripts/verify-card.sh
echo -n "$CARD" | wc -c                                  # → ≤ 200
grep -qE '^[[:space:]]*(Continue|Push|Commit|Probe|Wire|Document|Harden) ' <<<"$CARD"
grep -qE '/[A-Za-z0-9_./-]+\.(md|ts|astro|mjs|json|yaml|yml|mdx)' <<<"$CARD"
grep -qF 'Pass N+1' <<<"$CARD"                           # → explicit pillar
```

Run `~/.codebuff/skills/prompt-engineering/scripts/verify-card.sh
"$CARD"` to gate every emit; do not duplicate the recipe in
session code. If a card fails, the agent **re-prompts the upstream
task** instead of shipping the card. The goal is that any future
agent can read a card and reproduce the work verbatim.

### Card-Prompter — the prompt that produces cards

`scripts/verify-card.sh` validates; the **Card-Prompter** is the
prompt the model feeds itself to mint cards end-of-turn. From
`~/.agents/skills/prompt-engineering/SKILL.md`, verbatim:

```text
Given the work just completed in this turn, propose exactly three
followup cards for the next pass (Pass N+1) of the `daily-triage`
loop on the mupla-front repo.
Each card must satisfy the four-pillar card contract:
  1. Lead with a verb from
     {Continue, Push, Commit, Probe, Wire, Document, Harden}.
  2. Reference "Pass N+1" verbatim.
  3. Surface a path-shaped token matching
     /[A-Za-z0-9_./-]+\.(md|ts|astro|mjs|json|yaml|yml|mdx)/.
  4. Be ≤ 200 characters (count with `echo -n | wc -c`).
Output ONLY the three cards, one per line. No explanations, no
formatting, no commentary.
```

Behaviour contract for the prompter:

- Output is **only** the three cards, one per line.
- Each card must pass `scripts/verify-card.sh` (the prompter is
  responsible for self-validation before the agent calls
  `suggest_followups`).
- If any candidate card fails the gate, the agent re-runs the
  prompter with a tightened constraint note (e.g. "previous
  candidates were 230+ chars; trim aggressively") rather than
  shipping a card that will fail the next session's verifier.

### Skill invocation order at Pass N+1

The matt-pocock workflow family is the first stop:

| Step | Skill       | Used when                                       |
| ---- | ----------- | ----------------------------------------------- |
| 1    | `triage`    | Looking at GitHub issues — state-machine pass. |
| 2    | `to-issues` | Capturing ideas into the issue tracker.         |
| 3    | `to-prd`    | Lifting an idea into a self-contained PRD.      |
| 4    | `qa`        | User-reported bug → filed issue.                |
| 5    | `improve-codebase-architecture` | Long-arc code-quality audit.        |
| 6    | `diagnosing-bugs`              | Hard-bug / perf-regression diagnosis.        |
| 7    | `tdd`        | Anything user said should be test-first.        |
| 8    | `prompt-engineering` (this skill) | Every card-the-loop-emits must run through it. |

Step 8 is **mandatory** before step 1: any card that survives the
`prompt-engineering` four-pillar check is queueable.

## Surface updates a Pass N+1 must make

Before considering a card done, the loop expects to find **at least
one** of the following on disk after the pass:

- A `## Pass N+1 — YYYY-MM-DD` block in `loop-run-log.md`.
- A `pass_id = N+1` row in `STATE.md`, or no change if N+1 == N.
- A corresponding `docs/agents/triage-report-YYYY-MM-DD.md`,
  `docs/agents/triage-report-YYYY-MM-DD-pass-K.md`, or specific
  dossier file referenced from the card.
- A renamed / edited repo file whose path the card named.
- A new commit on `HEAD~N..HEAD` referencing the card verb in the
  message.

If **none** of these lands, the card did not actually execute and the
pass should log `Status: ABORTED — see loop-run-log.md` rather than
`Status: COMPLETE`.

## Failure modes (kill switch)

The pass aborts and halts the loop if any of these hold:

| Trigger                                          | Action                                          |
| ------------------------------------------------ | ----------------------------------------------- |
| A card passes the four-pillar check on leniency  | re-prompt upstream; do not emit the card       |
| A required skill is missing globally             | install per `skills-strategy.md`, document, retry |
| The session tries a hard-gated op               | per `docs/safety.md` → ABORT                    |
| `loop-audit` regresses two consecutive passes   | `## Kill switch` in `LOOP.md` → halt            |

## Manual override

The maintainer can paste a card at any time. The loop treats a
maintainer-pasted card as override-priority in the Pass N+1 queue:

- It runs immediately, ahead of any auto-emitted card.
- It is logged with a `Source: maintainer-paste` line in the Pass N+1
  entry.
- It is exempt from the `prompt-engineering` four-pillar check
  (the maintainer already vetted it).

## See also

- [`skills-strategy.md`](./skills-strategy.md) — which skills combine
  with this one.
- [`../safety.md`](../safety.md) — the operational denylist.
- [`../../LOOP.md`](../../LOOP.md) — pass sequence definition.
- [`../../loop-run-log.md`](../../loop-run-log.md) Pass 4 → Pass 4.1
  → Pass 4.2 → Pass 4.3 ladder shows the rule being rehearsed.
- `~/.codebuff/skills/prompt-engineering/SKILL.md` and the mirror
  in `~/.pi/skills/prompt-engineering/SKILL.md` — the skill that
  owns the *card contract*.
