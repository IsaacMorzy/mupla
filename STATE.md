# STATE.md - mupla-front loop-engineering checkpoint

> One-page operator dashboard for the next agent / human pickup. Fully overwritten per pass per LOOP.md §Handoff convention.

- **Project**: mupla-front (Astro + TinaCMS + Tailwind; Vercel deploy; Matt Pocock skills)
- **Pattern**: matt-pocock-skill + loop-engineering (Passes 1-12 closed)
- **Loop readiness score**: 95 / 100 (L3 - unattended loop safe). Held flat from Pass 11 since Pass 12 ops don't add new scoring gates.
- **Last updated**: pass 13.2 - 2026-07-06
- **Active GH project**: mupla-front triage (user-scoped under IsaacMorzy; 7 columns seeded idempotently; 30 issues attached in Backlog).
- **Active GH issues snapshot**: docs/agents/gh-triage-2026-07-06-pass-12.md (re-runnable).
- **Promoted T1 ticket**: #10 (bin/gh-create-issues.sh ran idempotently; T1 promote via gh issue edit --add-label ready-for-agent, allowed per docs/safety.md).

## Open human gates for Pass 12

Maintainer-only ops the agent NEVER executes (per docs/safety.md):

- **Push local commit to origin main**: maintainer pastes .
- **Prod Vercel deploy**: separate  confirm inside bin/prep-push.sh.
- **Categorise the 29 remaining needed-triage issues**: maintainer pastes  per ticket. (Top T1 already done; rest await maintainer.)
- **Trigger daily-triage cron**: maintainer merges  first.

## Drift recovery index

In-band drift events the agent caught and recovered (preserved verbatim from Pass 11):

- **Pass 8**:  artefact across 19 MDX files. Pass 8.3 dropped the comma-after-space.
- **Pass 8.1**: TinaCMS  schema mismatch. Pass 8.1 set ; reverted to additive in Pass 11.
- **Pass 8.2**: Em-dash overuse on 4 editorial pages. Pass 8.2 rewrote em-dash-free while preserving voice.
- **Pass 9**: Declared Pass 9 entry into loop-run-log.md did not land first attempt (brace-group syntax error in scripts/loop-audit-local.sh; python heredoc crash on em-dash U+2014 truncated unicode escape). Pass 9.1 re-emitted via bash heredoc with single-quoted delimiter; Pass 9.2 fixed brace-group.

## Predecessor chain

1 / 2 / 3 / 4 / 5 / 6 / 7 / 8 / 8.1 / 8.2 / 8.3 / 9 / 9.1 / 9.2 / 10 / 11 / 12 / 12.1 / 12.2 / 13 / 13.1 / 13.2

( suffix = corrective amendment inside the same integer pass.)

## Active GH issues

Live snapshot at  regenerated each pass close via [{"labels":[{"id":"LA_kwDOTOfmAM8AAAACqR4Ylg","name":"needs-triage","description":"Maintainer needs to evaluate","color":"fbca04"}],"number":17,"title":"**Vercel production build debugging (TinaCloud rebuild hook + `astro build` OOM @ 3072 MiB)**"},{"labels":[{"id":"LA_kwDOTOfmAM8AAAACqR4Ylg","name":"needs-triage","description":"Maintainer needs to evaluate","color":"fbca04"}],"number":16,"title":"Add `loop-engineering` MCP server status to readiness audit brief"},{"labels":[{"id":"LA_kwDOTOfmAM8AAAACqR4Ylg","name":"needs-triage","description":"Maintainer needs to evaluate","color":"fbca04"}],"number":15,"title":"Document override flow for human-only denylist ops"},{"labels":[{"id":"LA_kwDOTOfmAM8AAAACqR4Ylg","name":"needs-triage","description":"Maintainer needs to evaluate","color":"fbca04"}],"number":14,"title":"Add `docs/agents/kill-switch-test-2026-XX.md` drill report"},{"labels":[{"id":"LA_kwDOTOfmAM8AAAACqR4Ylg","name":"needs-triage","description":"Maintainer needs to evaluate","color":"fbca04"}],"number":13,"title":"Register `goal-engineering` pattern in `patterns/registry.yaml` (`status: not-active`)"},{"labels":[{"id":"LA_kwDOTOfmAM8AAAACqR4Ylg","name":"needs-triage","description":"Maintainer needs to evaluate","color":"fbca04"}],"number":12,"title":"Document per-pass worktree policy in `loop-constraints.md`"},{"labels":[{"id":"LA_kwDOTOfmAM8AAAACqR4Ylg","name":"needs-triage","description":"Maintainer needs to evaluate","color":"fbca04"}],"number":11,"title":"Add `sub-agent` section to `loop-constraints.md` (maker/checker split)"},{"labels":[{"id":"LA_kwDOTOfmAM8AAAACqR4Ylg","name":"needs-triage","description":"Maintainer needs to evaluate","color":"fbca04"},{"id":"LA_kwDOTOfmAM8AAAACqR5LQg","name":"ready-for-agent","description":"Fully specified; AFK-ready","color":"0e8a16"}],"number":10,"title":"Scaffold `scripts/loop-context.sh` (rehydrate `run.json` → STATE.md)"},{"labels":[{"id":"LA_kwDOTOfmAM8AAAACqR4Ylg","name":"needs-triage","description":"Maintainer needs to evaluate","color":"fbca04"}],"number":9,"title":"Wire `.github/workflows/daily-triage.yml` (night cron, 1 pass/day)"}]. Currently **30 open needs-triage issues** (Pass 12.2 landed 31; #18 promoted to ready-for-agent in Pass 12.2; Pass 13 close did NOT promote any new issues. Parser-vs-GH comm diff confirms zero missing titles + zero duplicates.) attached to GH Project  (#5) under IsaacMorzy. Top unaddressed T1 (#10) promoted to .

## Next pass (Pass 14)

3-bullet agenda lifted from docs/agents/triage-roadmap-2026-07-06.md Bucket C (content-data hygiene) - see the roadmap for the full 6-ticket list:

1. **`scripts/page-budget.sh` audit** (Bucket C #18, T2, ~25k tokens): run on Pages collection; warn if any page < 6 sections; emit `docs/agents/page-budget-2026-07-XX.md`. Score +0.
2. **Surface `processSteps` / Zakat-variant in CMS config** (Bucket C #17, T2, ~25k tokens, `needs-info`): maintainer-info-first; re-open with concrete acceptance once maintainer answers. Score +0.
3. **Defer Bucket C #19 `oxfam.astro` token audit** (T3, ~60k tokens, next-quarter): out of current sprint window per loop-budget.md; backlog to Q3. (T3-pick rendered as deferral ack per Pass 13.2 reviewer flag.)

## Onward contract (Pass N+1)

1. **Start.** Read STATE.md first; check  count via  (expect **29** after Pass 12 close); check  score (expect 95/100); confirm git working tree is clean.
2. **Mid-pass handoff.** If the pass exceeds 2 hours or 200k tokens, append a mid-pass note to loop-run-log.md () and continue.
3. **On close.** Append the new  entry to loop-run-log.md and overwrite this file (advance pass_id).
4. **Plan-vs-Execute surface declaration** (new Pass 12). Naming/planning artifacts go to docs/agents/; gate scripts go to bin/. Do NOT inline bash execution workflows inside docs/agents/*.md.

## open issues

Two pre-existing open issues still in , unchanged:

- **#3 (bug)**: TinaCMS schema mismatch blocks production deploys. State: ready-for-human (Vercel-side debugging).
- **#7 (enhancement)**: Modernize blog + token-violation sweep. State: ready-for-human (Vercel-debug dependency).

The 30 new  issues (Pass 12) listed in  and attached to GH Project #5.
