# STATE.md - mupla-front loop-engineering checkpoint

> One-page operator dashboard for the next agent / human pickup. Fully overwritten per pass per LOOP.md §Handoff convention.

- **Project**: mupla-front (Astro + TinaCMS + Tailwind; Vercel deploy; Matt Pocock skills)
- **Pattern**: matt-pocock-skill + loop-engineering (Passes 1-12 closed)
- **Loop readiness score**: 95 / 100 (L3 - unattended loop safe). Held flat from Pass 11 since Pass 12 ops don't add new scoring gates.
- **Last updated**: pass 38 - 2026-07-10 (6 issues closed as wontfix: #9, #10, #17, #18, #33, #49 — all already implemented/fixed; 41 issues remain open)
- **Active GH project**: mupla-front triage (user-scoped under IsaacMorzy; 7 columns seeded idempotently; 41 issues in Backlog after Pass 38 triage sweep).
- **Active GH issues snapshot**: docs/agents/gh-triage-2026-07-06-pass-12.md (re-runnable).
- **Promoted T1 ticket**: #10 (bin/gh-create-issues.sh ran idempotently; T1 promote via gh issue edit --add-label ready-for-agent, allowed per docs/safety.md).

## Open human gates for Pass 18

Maintainer-only ops the agent NEVER executes (HUMAN-ONLY per docs/safety.md as reaffirmed in Pass 17):

- **`gh issue edit --remove-label *`**: still human-only (asymmetric add-label reversal).
- **`gh pr close *`**: still human-only (rarer, more consequential).
- **`vercel deploy --prod *`**: still human-only (TinaCloud push hook is the gate).
- **`gh issue transfer *` / `gh repo archive *`**: still human-only.
- **`vercel env add *` / `vercel env rm *`**: still human-only (secret rotation).
- **Trigger daily-triage cron**: maintainer merges `.github/workflows/daily-triage.yml` first.
- **`bash bin/prep-push.sh` / `git push origin HEAD:main`**: still human-only (the agent may pre-stage but never auto-push).

Agent may run under pre-flight rules (Pass 16.2, retained after Pass 17):

- `git push origin *` (after `pnpm exec astro check` 0 errors + loop-run-log entry staged in the same commit).
- `gh issue create *` (additive; new arrivals land at the start node with `--label needs-triage`).
- `gh issue close *` (after closing comment posted in the same op window; `wontfix` label required).

## Drift recovery index

In-band drift events the agent caught and recovered (preserved verbatim from Pass 11):

- **Pass 8**:  artefact across 19 MDX files. Pass 8.3 dropped the comma-after-space.
- **Pass 8.1**: TinaCMS  schema mismatch. Pass 8.1 set ; reverted to additive in Pass 11.
- **Pass 8.2**: Em-dash overuse on 4 editorial pages. Pass 8.2 rewrote em-dash-free while preserving voice.
- **Pass 9**: Declared Pass 9 entry into loop-run-log.md did not land first attempt (brace-group syntax error in scripts/loop-audit-local.sh; python heredoc crash on em-dash U+2014 truncated unicode escape). Pass 9.1 re-emitted via bash heredoc with single-quoted delimiter; Pass 9.2 fixed brace-group.

## Predecessor chain

1 / 2 / 3 / 4 / 5 / 6 / 7 / 8 / 8.1 / 8.2 / 8.3 / 9 / 9.1 / 9.2 / 10 / 11 / 12 / 12.1 / 12.2 / 13 / 13.1 / 13.2 / 13.4 / 13.5 / 13.6 / 13.7 / 13.8 / 13.9 / 13.8 / 13.9 / 14 / 14.1 / 14.2 / 15 / 16 / 16.1 / 16.2 / 17 / 18 / 19 / 20 / 21 / 22 / 23 / 24 / 25 / 26 / 27 / 28 / 29 / 30 / 31 / 32 / 33 / 34 / 35 / 36 / 37

( suffix = corrective amendment inside the same integer pass.)

## Active GH issues

Live snapshot at  regenerated each pass close via [{"labels":[{"id":"LA_kwDOTOfmAM8AAAACqR4Ylg","name":"needs-triage","description":"Maintainer needs to evaluate","color":"fbca04"}],"number":17,"title":"**Vercel production build debugging (TinaCloud rebuild hook + `astro build` OOM @ 3072 MiB)**"},{"labels":[{"id":"LA_kwDOTOfmAM8AAAACqR4Ylg","name":"needs-triage","description":"Maintainer needs to evaluate","color":"fbca04"}],"number":16,"title":"Add `loop-engineering` MCP server status to readiness audit brief"},{"labels":[{"id":"LA_kwDOTOfmAM8AAAACqR4Ylg","name":"needs-triage","description":"Maintainer needs to evaluate","color":"fbca04"}],"number":15,"title":"Document override flow for human-only denylist ops"},{"labels":[{"id":"LA_kwDOTOfmAM8AAAACqR4Ylg","name":"needs-triage","description":"Maintainer needs to evaluate","color":"fbca04"}],"number":14,"title":"Add `docs/agents/kill-switch-test-2026-XX.md` drill report"},{"labels":[{"id":"LA_kwDOTOfmAM8AAAACqR4Ylg","name":"needs-triage","description":"Maintainer needs to evaluate","color":"fbca04"}],"number":13,"title":"Register `goal-engineering` pattern in `patterns/registry.yaml` (`status: not-active`)"},{"labels":[{"id":"LA_kwDOTOfmAM8AAAACqR4Ylg","name":"needs-triage","description":"Maintainer needs to evaluate","color":"fbca04"}],"number":12,"title":"Document per-pass worktree policy in `loop-constraints.md`"},{"labels":[{"id":"LA_kwDOTOfmAM8AAAACqR4Ylg","name":"needs-triage","description":"Maintainer needs to evaluate","color":"fbca04"}],"number":11,"title":"Add `sub-agent` section to `loop-constraints.md` (maker/checker split)"},{"labels":[{"id":"LA_kwDOTOfmAM8AAAACqR4Ylg","name":"needs-triage","description":"Maintainer needs to evaluate","color":"fbca04"},{"id":"LA_kwDOTOfmAM8AAAACqR5LQg","name":"ready-for-agent","description":"Fully specified; AFK-ready","color":"0e8a16"}],"number":10,"title":"Scaffold `scripts/loop-context.sh` (rehydrate `run.json` → STATE.md)"},{"labels":[{"id":"LA_kwDOTOfmAM8AAAACqR4Ylg","name":"needs-triage","description":"Maintainer needs to evaluate","color":"fbca04"}],"number":9,"title":"Wire `.github/workflows/daily-triage.yml` (night cron, 1 pass/day)"}]. Currently **30 open needs-triage issues** (Pass 12.2 landed 31; #18 promoted to ready-for-agent in Pass 12.2; Pass 13 close did NOT promote any new issues. Parser-vs-GH comm diff confirms zero missing titles + zero duplicates.) attached to GH Project  (#5) under IsaacMorzy. Top unaddressed T1 (#10) promoted to .

## Pass 38 triage summary

**Closed (6 issues)**: All already implemented or fixed in prior passes:
- #9: `.github/workflows/daily-triage.yml` — already exists
- #10: `scripts/loop-context.sh` — already exists
- #17: Vercel build OOM — fixed in Pass 35/37 (heap split + imageService offload)
- #18: `scripts/axe-core.sh` — already exists
- #33: `category` enum on blog.ts — already exists (line 29)
- #49: IslamicPattern + IslamicDivider — both components already exist in `src/components/ui/`

**Ready-for-agent (15 issues)**: #22, #23, #24, #28, #32, #34, #37, #41, #42, #43, #44, #45, #48, #50
**Needs-triage (20 issues)**: #11–#16, #19–#21, #25, #26, #29–#31, #35, #36, #38, #39, #46, #47
**Ready-for-human (3 issues)**: #3, #7, #40

## Next pass (Pass 39)

Carried forward from Pass 38:

1. **Continue triage** — process remaining needs-triage issues (#11-#47).
2. **Pick up ready-for-agent** — start with #22 (keyboard nav docs) or #32 (publishStatus enum).
3. **Run axe-core a11y audit** requires Chrome installed locally.

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
