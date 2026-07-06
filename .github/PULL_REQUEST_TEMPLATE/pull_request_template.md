## What
<!-- Plain prose. What does the PR do? Reference any GitHub issue this closes. -->

## Why
<!-- Context for the reviewer. -->

## Surface(s) touched
<!-- Check all that apply. -->
- [ ] `src/pages/**`
- [ ] `src/components/**`
- [ ] `src/content/**`
- [ ] `tina/collections/**`
- [ ] `src/styles/global.css`
- [ ] other: ____________________________

## Verification
<!-- Tell the reviewer how to run + what to look at. -->
- [ ] `pnpm astro check` → 0 errors / 0 warnings / 0 hints
- [ ] `pnpm build` passes locally (or describe the failure)
- [ ] `pnpm tinacms build --local` passes (when schema touched)
- [ ] Light + dark render eyeballed locally
- [ ] Brand voice check applied (`docs/agents/session-audit-2026-07-06.md` §2)

## Loop / tracker
- [ ] I updated `docs/agents/redesign-roadmap.md` §3.1 if the change closes an issue
- [ ] I appended a per-file pass entry to `loop-run-log.md` if the change was made by the daily-triage loop
- [ ] I did NOT `git push`, `gh issue close`, or `vercel deploy --prod` (gated human-only per `docs/safety.md`)
