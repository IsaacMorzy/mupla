# Triage report - 2026-07-06 (Pass 12)
## Issue-creation run

This report captures the output of `bin/gh-create-issues.sh`: each Pass-11
roadmap ticket mapped to one GitHub issue with `--label needs-triage`. The
agent ran the burst during Pass 12 close; tickets already-open by title
match were skipped (idempotent on re-run).

- skip: Wire `.github/workflows/daily-triage.yml` (night cron, 1 pass/day) (already #9)
- skip: Scaffold `scripts/loop-context.sh` (rehydrate `run.json` → STATE.md) (already #10)
- skip: Add `sub-agent` section to `loop-constraints.md` (maker/checker split) (already #11)
- skip: Document per-pass worktree policy in `loop-constraints.md` (already #12)
- skip: Register `goal-engineering` pattern in `patterns/registry.yaml` (`status: not-active`) (already #13)
- skip: Add `docs/agents/kill-switch-test-2026-XX.md` drill report (already #14)
- skip: Document override flow for human-only denylist ops (already #15)
- skip: Add `loop-engineering` MCP server status to readiness audit brief (already #16)
- skip: **Vercel production build debugging (TinaCloud rebuild hook + `astro build` OOM @ 3072 MiB)** (already #17)
- #18: Scaffold `scripts/axe-core.sh` (axe invocation via headless Chrome + Playwright) - https://github.com/IsaacMorzy/mupla/issues/18
- #19: Generate `docs/agents/a11y-baseline-2026-XX-XX.md` (axe-core sweep on home, donate, contact) - https://github.com/IsaacMorzy/mupla/issues/19
- #20: Add `aria-live` annotations on the donation tier CTAs - https://github.com/IsaacMorzy/mupla/issues/20
- #21: Audit focus trap on modal/dialog components - https://github.com/IsaacMorzy/mupla/issues/21
- #22: Document keyboard navigation in DESIGN.md §8 - https://github.com/IsaacMorzy/mupla/issues/22
- #23: Reduce-motion Honour (carve-out, oxfam.astro) - https://github.com/IsaacMorzy/mupla/issues/23
- #24: Phone/address cleanup on `contact.mdx` + `faq.mdx` - https://github.com/IsaacMorzy/mupla/issues/24
- #25: Add `phone` + `addressLine1` + `addressLine2` + `city` to `tina/collections/global-config.ts` - https://github.com/IsaacMorzy/mupla/issues/25
- #26: Surface processSteps / Zakat-contained variant in CMS config - https://github.com/IsaacMorzy/mupla/issues/26
- #27: Page section budget track (count sections per page; warn if < 6) - https://github.com/IsaacMorzy/mupla/issues/27
- #28: Token audit on `oxfam.astro` (carve-out test) - https://github.com/IsaacMorzy/mupla/issues/28
- #29: Voice spot-check on fresh content using `~/.agents/skills/brand/SKILL.md` - https://github.com/IsaacMorzy/mupla/issues/29
- #30: `data-tier` schema migration: enum on `cta.template.ts` actions - https://github.com/IsaacMorzy/mupla/issues/30
- #31: Wire analytics on `cta.template.ts` tier clicks (data attr → Plausible custom event) - https://github.com/IsaacMorzy/mupla/issues/31
- #32: `publishStatus` enum on `tina/collections/blog.ts` - https://github.com/IsaacMorzy/mupla/issues/32
- #33: `category` enum / derived on `tina/collections/blog.ts` - https://github.com/IsaacMorzy/mupla/issues/33
- #34: Author byline schema → reference `team` collection. **NOTE: de-normalisation pass is content mass-rewrite; recommend maintainer eyeball before agent migration** - https://github.com/IsaacMorzy/mupla/issues/34
- #35: Wire `~/.agents/skills/writing-shape` invocation quick-load in AGENTS.md - https://github.com/IsaacMorzy/mupla/issues/35
- #36: Wire `donate.mdx` data-tier analytics to Plausible first-touch - https://github.com/IsaacMorzy/mupla/issues/36
- #37: Donor thank-you email sequence (post-donate webhook) — **agent creates with `needs-triage`; maintainer pastes `ready-for-human` once email infra is wired** - https://github.com/IsaacMorzy/mupla/issues/37
- #38: Survey post-event satisfaction form (via ContactForm block config) — **agent creates with `needs-triage`; maintainer pastes `ready-for-human`** - https://github.com/IsaacMorzy/mupla/issues/38
- #39: Recurring-gift opt-out link on receipt — **agent creates with `needs-triage`; maintainer pastes `ready-for-human`** - https://github.com/IsaacMorzy/mupla/issues/39

## Summary

- Total tickets in roadmap: 31
- Created this run:        22
- Already-open by title:    9

## Maintainer-pasted commands

The agent committed the loop-owned Pass 12 files locally. To fast-forward
main and (optionally) trigger Vercel:

```bash
bash bin/prep-push.sh
```

## Triage pass for the maintainer

After applying , the maintainer pastes these 
snippets to migrate the T1 tickets from  to .
The agent can ALSO run these  lines per
 (add-only is allowed; remove is human-only):

```bash
# Promote Passport 11's T1 tickets (replace $N with the actual issue numbers
# the report above prints):
gh issue edit $N --repo IsaacMorzy/mupla --add-label ready-for-agent
```
