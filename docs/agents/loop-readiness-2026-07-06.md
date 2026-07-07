# Loop Readiness Audit Brief — 2026-07-06 (Pass 9 / Pass 9.1)

Captured from `bash scripts/loop-audit-local.sh` against the current on-disk tree. Captures where mupla-front sits on loop-engineering's primitive matrix; identifies the gaps that move L1 → L2 and L2 → L3.

## Headline

| Slot | Value | Notes |
| --- | ---: | --- |
| Local loop-audit score | **80 / 100** | Matches STATE.md `## loop readiness progression` for Pass 9. |
| Level | **L2 (assisted fixes land)** | bucket `score <= 84` per `scripts/loop-audit-local.sh`; 6 points above the L1 ceiling the script emits. |
| Pass id | 9 (9.1 corrective) | Re-audited after script rewrite; see `## Pass 9` and `## Pass 9.1` in `loop-run-log.md`. |
| Scope of this audit | 5 building blocks + memory; one of 7 registered patterns active | Cross-walk lives at `loop-design-checklist.md`. |

## Per-primitive findings

### Automations / Scheduling (10 / 15)

- ✓ 1-pass-per-day cadence documented in `LOOP.md` §"Pattern: daily-triage".
- ✓ Kill switches in `LOOP.md` §"Kill switch" and `loop-budget.md` §"Kill-switch thresholds".
- ☐ `.github/workflows/daily-triage.yml` is MISSING. Degrades to manual cron only. L3 unblocked by this single file.

### Worktrees (0 / 15)

- ☐ Worktree policy not documented in `loop-constraints.md`.
- ☐ Passes commit sequentially without per-pass worktree. Recommended at L2 to reduce abort cost.

### Skills (15 / 15)

- ✓ Globally installed: `~/.agents/skills/{writing-fragments,writing-shape,writing-beats,brand,prompt-engineering,design-taste-frontend}/` plus a wider surface of additional skills (ask-matt, banner-design, design, design-system, design-an-interface, develop-userscripts, diagnosing-bugs, codebase-design, etc. — see `ls ~/.agents/skills/` for full list). Cross-referenced into `AGENTS.md` §"matt-pocock skills".
- ✓ `prompt-engineering/scripts/verify-card.sh` is executable and self-tested against the 5-card matrix.

### Plugins & Connectors (15 / 20)

- ✓ `loop-mcp-server` wired into `~/.config/codebuff/mcp.json` (Pass 2).
- ✓ `gh` CLI allowed (read-only) per `docs/safety.md`; `tina-island/[name].ts` covers content edit.
- ☐ Axe-core / Lighthouse run has not yet been wired. Recommend Pass 10.

### Sub-agents (0 / 15)

- ☐ No maker / checker split documented.
- ☐ Sub-agent primitive is not registered in `patterns/registry.yaml`.

### Memory / State (40 / 40)

- ✓ `STATE.md`, `LOOP.md`, `loop-run-log.md`, `docs/safety.md`: all present.
- ✓ `loop-budget.md`, `loop-constraints.md`, `patterns/registry.yaml`: all present.
- ✓ Cross-link checks pass: each of `LOOP.md`, `STATE.md`, `loop-constraints.md`, `docs/safety.md` references its sibling.
- ✓ `gh` drift check: `loop-sync --dry-run -v` clean since Pass 3.

## L1 → L2 levers (the +6 → +18 zone)

The four candidates below total `+5 +5 +3 +5 = +18`. Net lift from 80 / 100 → 98 / 100 (since `.github/workflows` is the +10 to land at L3 separately).

1. **Sub-agent (maker/checker) split** — add a `sub-agent` section to `loop-constraints.md` documenting the maker / checker pattern. Costs ~20 lines. Score +5.
2. **Worktree policy** — document in `loop-constraints.md` how a pass creates + cleans up a per-pass worktree via `git worktree add`. Costs ~15 lines. Score +5.
3. **Goal Engineering pattern** — register in `patterns/registry.yaml` as `goal-engineering` (`status: not-active`). Costs ~6 lines. Score +3.
4. **Axe-core audit script** — `scripts/axe-core.sh` runs an axe invocation against the live dev server. Costs ~20 lines. Score +5.

## L2 → L3 levers (84 → 100)

1. `.github/workflows/daily-triage.yml` — schedule unattended. Score +10.
2. `scripts/loop-context.sh` — wire `loop-context --check --ledger run.json` into STATE.md rehydrate. Score +5.

## Open human gates

- Maintainer eyeball + commit + push of the Pass 9 + 9.1 loop-owned commits.
- Same gates as Pass 8.3.
- Out-of-loop housekeeping (16 WIP files) is NOT a Pass 9 gate.

## Self-grade

GOOD — Pass 9 lands at 80 / 100 (L2) with a clear path to L2 documented in `loop-design-checklist.md` (4 specific candidate levers summing +18). Pass 9.1 corrective ships a working local `loop-audit-local.sh` (the Pass 9 first attempt had a bash brace-group syntax error that broke `&&` chain short-circuit), inserts the Pass 9 entry into `loop-run-log.md`, fixes two em-dashes the Pass 9 add-block introduced into README's GitHub-rendered orientation rows, and corrects the readiness brief math from `+24` to `+18`.
