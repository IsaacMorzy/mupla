# GH Triage Snapshot - 2026-07-06 (Pass 12)

**Snapshot generated at Pass 12 close.** Re-runnable via:
```bash
bash bin/gh-create-issues.sh  # idempotent on title match
bash bin/gh-setup-project.sh  # idempotent; seeds missing columns + adds items
```

## Open needs-triage issues

Total: 9 issues.

| # | Title | Labels | State |
|---|-------|--------|-------|
| #17 | **Vercel production build debugging (TinaCloud rebuild hook + `astro build` OOM @ 3072 MiB)** | `needs-triage` | open |
| #16 | Add `loop-engineering` MCP server status to readiness audit brief | `needs-triage` | open |
| #15 | Document override flow for human-only denylist ops | `needs-triage` | open |
| #14 | Add `docs/agents/kill-switch-test-2026-XX.md` drill report | `needs-triage` | open |
| #13 | Register `goal-engineering` pattern in `patterns/registry.yaml` (`status: not-active`) | `needs-triage` | open |
| #12 | Document per-pass worktree policy in `loop-constraints.md` | `needs-triage` | open |
| #11 | Add `sub-agent` section to `loop-constraints.md` (maker/checker split) | `needs-triage` | open |
| #10 | Scaffold `scripts/loop-context.sh` (rehydrate `run.json` → STATE.md) | `needs-triage`, `ready-for-agent` | open |
| #9 | Wire `.github/workflows/daily-triage.yml` (night cron, 1 pass/day) | `needs-triage` | open |

## GH Project board

- **Name**: mupla-front triage
- **Owner**: IsaacMorzy
- **URL**: https://github.com/users/IsaacMorzy/projects/5
- **Columns** (idempotent seed): Backlog / needs-triage / ready-for-agent / ready-for-human / needs-info / wontfix / done

## Pre-existing open issues (carried from pre-Pass-12)

- **#3 (bug)**: TinaCMS schema mismatch blocks production deploys. State: `ready-for-human`.
- **#7 (enhancement)**: Modernize blog + token-violation sweep. State: `ready-for-human`.
