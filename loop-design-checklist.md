# loop-design-checklist.md — mupla-front ↔ loop-engineering cross-walk

This is the cross-walk between mupla-front's actual loop surface and the [loop-engineering](https://github.com/cobusgreyling/loop-engineering) Five Building Blocks + Memory matrix. Categories match the upstream README §"The Five Building Blocks + Memory".

Lifted from the loop-engineering README; completed entries are real on-disk state, missing entries are Pass 9+ candidates.

## Automations / Scheduling — discovery + triage on a cadence

| Question | Status | File / evidence |
| --- | --- | --- |
| Is there a documented cadence? | ✓ | `LOOP.md` §"Pattern: daily-triage" — 1 pass/day, L1 informational |
| Is there a kill switch? | ✓ | `LOOP.md` §"Kill switch"; `loop-budget.md` §"Kill-switch thresholds" |
| Is the cadence enforced by a scheduler? | ☐ | `.github/workflows/daily-triage.yml` not yet. Pass 10 candidate. |

## Worktrees — safe parallel execution

| Question | Status | File / evidence |
| --- | --- | --- |
| Is the worktree policy documented? | ☐ | `loop-constraints.md` does not yet cover worktree creation / cleanup. Pass 10 candidate. |
| Does each pass run in its own worktree? | ☐ | Passes commit sequentially; no per-pass worktree. Recommended at L2. |

## Skills — persistent project knowledge

| Question | Status | File / evidence |
| --- | --- | --- |
| Are skills globally installed? | ✓ | `~/.agents/skills/{writing-fragments,writing-shape,writing-beats,brand,prompt-engineering}/` mirrored to `~/.codebuff/skills/`, `~/.pi/skills/`. See `AGENTS.md` §"matt-pocock skills". |
| Are skills cross-referenced into the repo? | ✓ (new in Pass 9) | `AGENTS.md` §"matt-pocock skills (globally installed)"; `docs/agents/skills-strategy.md`. |
| Does `prompt-engineering` have a verifier? | ✓ | `~/.agents/skills/prompt-engineering/scripts/verify-card.sh` — 5-card matrix self-tested in Pass 5.1 + each subsequent pass. |

## Plugins & Connectors — reach into real tools (MCP)

| Question | Status | File / evidence |
| --- | --- | --- |
| Is `loop-mcp-server` wired? | ✓ | `~/.config/codebuff/mcp.json` lists `loop-mcp-server` alongside `playwright`. Per Pass 2. |
| Does the loop use the `gh` CLI? | ✓ | `gh issue list`, `gh issue view`, `gh label list` are read-only CLIs allowed by `docs/safety.md`. |
| Is `Tina` connected for content edits? | ✓ | `tina-island/[name].ts` route is the on-demand Astro endpoint for visual editing. |
| Does the loop use axe-core / Lighthouse? | ☐ | Static aria sweep is good (Pass 7); dynamic focus/contrast audit deferred to Pass 9. |

## Sub-agents — maker / checker split

| Question | Status | File / evidence |
| --- | --- | --- |
| Does each pass have a maker / checker split? | ☐ | Current pass output is single-agent; reviewer-minimax-m3 + verifier scripts provide the closest analog. Recommended at L2. |
| Are sub-agents registered in `patterns/registry.yaml`? | ☐ | Not yet. The 7 patterns in `patterns/registry.yaml` cover the macros, not the sub-agent primitives. |

## Memory / State — durable spine outside any conversation

| Question | Status | File / evidence |
| --- | --- | --- |
| Is there a current-pass progress marker? | ✓ | `STATE.md` (overwritten per pass; `pass_id` table). |
| Is there an append-only history? | ✓ | `loop-run-log.md` (one section per pass; never edited). |
| Cross-link to `LOOP.md`? | ✓ | `STATE.md` and `LOOP.md` cross-reference each other (verify-grep OK). |
| Drift detection? | ✓ | `loop-sync --dry-run -v` is in the loop's pass sequence; warnings closed in Pass 3. |
| Goal companion? | ☐ | Goal Engineering is upstream but not registered in `patterns/registry.yaml`. Pass 10 candidate. |

## Levels — phased roll-out

| Slot | Value | Notes |
| --- | --- | --- |
| L0 (scaffolding absent) | ✓ past | Pass 0 / 0 measurements moved the score from 25 → 74. |
| L1 (report-only daily loop) | ✓ past    | `STATE.md` `## loop readiness progression` row for Pass 8.3 reads `80/100 (L1)`. |
| L2 (assisted fixes land) | ✓ current | Threshold ≥ 60; need `loop-context`, sub-agent split, worktree policy. |
| L3 (unattended loop safe) | ☐ future | Threshold ≥ 85; need `.github/workflows/daily-triage.yml` and override flow. |

## See also

- `loop-run-log.md` — append-only per-pass history.
- `STATE.md` — current-pass progress marker.
- `docs/agents/loop-readiness-2026-07-06.md` — Pass 9 readiness audit brief.
- `scripts/loop-audit-local.sh` — filesystem-presence scoring proxy (Pass 9).
- `patterns/registry.yaml` — registered patterns (1 active, 6 catalogued).
