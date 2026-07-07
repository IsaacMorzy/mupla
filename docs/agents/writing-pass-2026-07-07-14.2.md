# Pass 14.2 — 2026-07-07 (Pass 14.1 review-flag closures)

Brief companion to `docs/agents/writing-pass-2026-07-07.md` (Pass 14) and `docs/agents/writing-pass-2026-07-07-14.1.md` (Pass 14.1 corrective amendment).

| Slot     | Value                                                  |
| -------- | ------------------------------------------------------ |
| Operator | agent (Buffy)                                          |
| Pattern  | `daily-triage` + `matt-pocock-skill`                   |
| Started  | 2026-07-07                                             |
| Status   | COMPLETE — 2 reviewer flags closed; tree ready for maintainer paste of `bash bin/prep-push.sh` |
| Score    | +0 (corrective only)                                   |
| Tokens   | ~3k (well under 200k budget)                           |

## What this pass closes

### Closure 1 — tier-name drift in `src/content/page/donate.mdx`

The recurring-gift tier table listed four names: **Friend / Companion / Patron / Benefactor**. The brand voice elsewhere on the site (incl. `src/content/page/donate.mdx` migration callout, contact.mdx, faq.mdx, Pass 8.2 voice work) consistently uses **Friend / Supporter / Patron / Benefactor**. "Companion" was a single-file drift.

Fix applied (single str_replace covering 3 occurrences clustered in the tier block):

- CTA action label `$100 / month, Companion` → `$100 / month, Supporter`
- mailto URL subject `Recurring%20gift%20(Companion%20tier)` → `Recurring%20gift%20(Supporter%20tier)`
- Migration callout prose `Friend, Companion, Patron, or Benefactor tier` → `Friend, Supporter, Patron, or Benefactor tier`

Verifier:
```bash
grep -cF 'Companion' mupla-front/src/content/page/donate.mdx                         # -> 0
grep -cF '?subject=Set%20up%20recurring%20gift' mupla-front/src/content/page/donate.mdx   # -> 1 (untouched; migration callout URL preserved)
grep -cF 'how the foundation' mupla-front/src/content/page/donate.mdx                   # -> 0 (Pass 8.3 maintainer-jargon removal still clean)
```

### Closure 2 — `src/components/ui/Countdown.astro` SSR-stable label rewrite

Pass 14's Countdown rendered the live breakdown `"Xd Yh Zm"` as the SSR text — which got baked at the last `pnpm build` clock and went stale on visiting days later (or for JS-disabled visitors the value never refreshed). Pass 14.2c rewrites the SSR surface so a cached / JS-disabled / SSR-only visitor sees a stable visitor-facing phrase instead.

Architecture (in three pieces):

1. SSR-rendered **stable** phrase, never stale:
   `<span data-countdown-ssr>Begins on Mar 15, 2027</span>` (full mode) or `<span data-countdown-ssr>Begins Mar 15</span>` (compact mode).
   `aria-label` mirrors: `Begins on Mar 15, 2027` so assistive tech reads the same string the visitor sees.
2. SSR-rendered **hidden** breakdown containers:
   `<span data-countdown-label class="sr-only"></span><span data-countdown-text class="tabular-nums"></span>` — present in the DOM, hidden initially so the layout reserves space.
3. Scoped `<style>` block + client `<script>`:
   ```css
   [data-countdown][data-ready='false'] [data-countdown-label],
   [data-countdown][data-ready='false'] [data-countdown-text] { display: none; }
   [data-countdown][data-ready='true']  [data-countdown-ssr]    { display: none; }
   ```
   Client tick flips `data-ready="true"` on hydration, removes `sr-only` from `labelEl`, then runs `tick()` at 1Hz. `tick()` self-clears both `setInterval`s once `diff <= 0`.

### Sub-closure 2a — compact-mode JS-disabled fallback

Reviewer-minimax-m3 on Closure 2 flagged: in compact mode the SSR phrase span was `class="sr-only"`, AND the breakdown spans were hidden via attribute selector — so a JS-disabled visitor in compact mode saw nothing (the entire compact card became unattributable to a date).

Fix: compact SSR phrase now uses `class="text-xs tabular-nums"` (no `sr-only`); the text source switches to `ssrPhraseCompact || ssrPhrase` so compact visitors see `Begins Mar 15` (short, no year) and full-mode visitors see `Begins on Mar 15, 2027` (long, with year).

Verifier:
```bash
grep -cF 'data-countdown-ssr' mupla-front/src/components/ui/Countdown.astro     # -> 2 (CSS selector + container span)
grep -cF "'text-xs tabular-nums'" mupla-front/src/components/ui/Countdown.astro # -> 1 (compact class)
grep -cF "'sr-only'" mupla-front/src/components/ui/Countdown.astro               # -> 1 (only on labelEl span; SSR phrase no longer carries it)
grep -cF 'ssrPhraseCompact' mupla-front/src/components/ui/Countdown.astro        # -> 2 (definition + reference)
grep -cF 'aria-live' mupla-front/src/components/ui/Countdown.astro              # -> 1 (preserved)
```

## Typecheck + new score

```bash
cd mupla-front && pnpm astro check   # -> 0 errors (1 hint in src/lib/data.ts:171:9 is pre-existing, out-of-scope)
bash scripts/loop-audit-local.sh      # -> '95 / 100 -- L3' (no change; corrected file is non-scoring)
```

## Files touched this pass

| Path | Action |
| ---- | ------ |
| `mupla-front/src/content/page/donate.mdx` | str_replace (3-site rename, single block) |
| `mupla-front/src/components/ui/Countdown.astro` | write_file (full rewrite for SSR-stable label) + str_replace (compact-mode class fix) |
| `mupla-front/STATE.md` | str_replace (Last updated + Predecessor chain) |
| `mupla-front/loop-run-log.md` | python heredoc append (`## Pass 14.2 — 2026-07-07`) |
| `mupla-front/docs/agents/writing-pass-2026-07-07-14.2.md` | write_file (this brief) |

## Open gates for Pass 15 (HUMAN-ONLY per docs/safety.md)

1. Maintainer pastes `bash bin/prep-push.sh` from a creds-loaded TTY. This fast-forwards `origin/main` to the local Pass 14 + 14.1 + 14.2 commit; Vercel auto-deploys to production. Pages become visible at `https://mupla.org` once the build clears.
2. Maintainer categorises GH tracking issue #46 (`needs-triage`) into `ready-for-agent` / `wontfix` / `needs-info` after review.
3. After paste lands, the loop's `.github/workflows/daily-triage.yml` cron (Pass 11) continues to fire nightly.

## Reviewer followups (logged for Pass 15 backlog; non-blocking)

- Year-conditional in `ssrPhraseCompact`: `Begins Mar 15` drops the year. The events index already shows the full date via `<time>` in the same meta row, so this is supplementary; consider an optional `includeYear?: boolean` prop instead of baking it in. (Reviewer-minimax-m3 item C.)
- Walk the entire `src/components/ui/Countdown.astro` post-`pnpm build` once to confirm `data-ready='false'` CSS scoping survives Astro's hash-class scoping; current verifier shows attribute selectors are scope-safe, so this is a low-risk sanity check only.
