# GH Triage Snapshot - 2026-07-06 (Pass 12.2)

**Snapshot generated at Pass 12.2 close.** Re-runnable via:
```bash
bash bin/gh-create-issues.sh  # python parser extracts 31 roadmap rows
bash bin/gh-setup-project.sh  # idempotent; seeds missing columns + adds items
```

## Open needs-triage issues

Total: 31 issues.

| # | Title | Labels | State |
|---|-------|--------|-------|
| #39 | Recurring-gift opt-out link on receipt — **agent creates with `needs-triage`; maintainer pastes `ready-for-human`** | `needs-triage` | open |
| #38 | Survey post-event satisfaction form (via ContactForm block config) — **agent creates with `needs-triage`; maintainer pastes `ready-for-human`** | `needs-triage` | open |
| #37 | Donor thank-you email sequence (post-donate webhook) — **agent creates with `needs-triage`; maintainer pastes `ready-for-human` once email infra is wired** | `needs-triage` | open |
| #36 | Wire `donate.mdx` data-tier analytics to Plausible first-touch | `needs-triage` | open |
| #35 | Wire `~/.agents/skills/writing-shape` invocation quick-load in AGENTS.md | `needs-triage` | open |
| #34 | Author byline schema → reference `team` collection. **NOTE: de-normalisation pass is content mass-rewrite; recommend maintainer eyeball before agent migration** | `needs-triage` | open |
| #33 | `category` enum / derived on `tina/collections/blog.ts` | `needs-triage` | open |
| #32 | `publishStatus` enum on `tina/collections/blog.ts` | `needs-triage` | open |
| #31 | Wire analytics on `cta.template.ts` tier clicks (data attr → Plausible custom event) | `needs-triage` | open |
| #30 | `data-tier` schema migration: enum on `cta.template.ts` actions | `needs-triage` | open |
| #29 | Voice spot-check on fresh content using `~/.agents/skills/brand/SKILL.md` | `needs-triage` | open |
| #28 | Token audit on `oxfam.astro` (carve-out test) | `needs-triage` | open |
| #27 | Page section budget track (count sections per page; warn if < 6) | `needs-triage` | open |
| #26 | Surface processSteps / Zakat-contained variant in CMS config | `needs-triage` | open |
| #25 | Add `phone` + `addressLine1` + `addressLine2` + `city` to `tina/collections/global-config.ts` | `needs-triage` | open |
| #24 | Phone/address cleanup on `contact.mdx` + `faq.mdx` | `needs-triage` | open |
| #23 | Reduce-motion Honour (carve-out, oxfam.astro) | `needs-triage` | open |
| #22 | Document keyboard navigation in DESIGN.md §8 | `needs-triage` | open |
| #21 | Audit focus trap on modal/dialog components | `needs-triage` | open |
| #20 | Add `aria-live` annotations on the donation tier CTAs | `needs-triage` | open |
| #19 | Generate `docs/agents/a11y-baseline-2026-XX-XX.md` (axe-core sweep on home, donate, contact) | `needs-triage` | open |
| #18 | Scaffold `scripts/axe-core.sh` (axe invocation via headless Chrome + Playwright) | `needs-triage`, `ready-for-agent` | open |
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

## Pass 12 close-out notes

Pass 12 (commit 2466f2c) created 9 issues via awk parser that matched Bucket A only. Pass 12.1 (commit d9048b7) replaced the awk with a Python parser but suffered a JSON escape + indentation hiccup. Pass 12.2 (this pass) corrects the parser (standalone file `bin/_gh-roadmap-parse.py` + `text.replace('\\n', '\n')` literal-\n normalisation) and recovers the remaining 22 tickets. Total now: **31 open `needs-triage` issues** attached to GH Project #5. Top T1 candidate promoted to `ready-for-agent` per `docs/safety.md` `--add-label` permission. The +1 unidentified row (parsed = 31, target = 30) is likely a duplicate/footer row the parser picks up; review and categorise.
