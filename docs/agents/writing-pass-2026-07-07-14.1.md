# Writing pass — 2026-07-07 (Pass 14.1 — corrective amendment)

> Companion to [`writing-pass-2026-07-07.md`](./writing-pass-2026-07-07.md) which covers the original Pass 14 rollout. This document covers Pass 14.1 — the corrective amendment logged as `## Pass 14.1` in `loop-run-log.md` per the repo's standing-amendment pattern (Pass 4.1 / 8.1 / 8.2 / 13.1 / 13.2 / 13.3).
>
> Pass 14.1 was triggered by the user re-sending the same writing-pass prompt. Pass 14 had only swept 6 of 10 page MDX + 0 of 6 blog MDX; the "all of them" scope implied the rest. Pass 14.1 closes that gap mechanically without bumping the pass counter to 15.

## What landed

Two `sed -i` substitutions across 9 untouched MDX files (one command, applied via basher):

1. **`s/,  /, /g`** — drops the comma-then-double-space artifact that lingered after the Pass 6 em-dash sweep + Pass 10 space-comma cleanup. The Pass 10 sweep normalised the *opposite* direction (` ,` → `, `). Pass 14.1 handles the remaining direction. Removes hundreds of `,  ` instances across `contact.mdx` / `faq.mdx` / `terms.mdx` / `privacy.mdx` + the 5 visible blogs.
2. **Phone-placeholder rephrase** — `s/call please email hello@mupla\.org for our current phone number/request our current phone number by emailing hello@mupla\.org/g` and the parallel mailing-address rewrite. Closes the clunky Pass 11 placeholder pattern that lived across 2 body sites and 2 callouts.

A follow-up `str_replace` closed the one residual site the sed didn't match — `contact.mdx`'s `**Phone:** please email hello@mupla.org for our current phone number (Mon-Fri, 9am-5pm)` body line — because it lacks the `call` prefix and so didn't match the main sed. After the close: phone-number requests are now consistent across prose, callouts, and the contact-info table row.

## Untouched by design

- `src/content/blog/why-tinacms.mdx` — build-pipeline placeholder kept to satisfy TinaCloud's stale content index. Visitor-hidden per `HIDDEN_BLOG_FILENAMES` (Pass 11). Not appropriate to rewrite.
- The 6 page MDX (`home`, `about`, `programs`, `donate`, `get-involved`, `team`) + 4 event MDX already polished in Pass 14.
- The events MDX files, `Countdown.astro`, and Pass 14 ledger bumps from Pass 14 itself — no double-bumps here.

## Verifiers

```bash
grep -cP ',  ' src/content/page/contact.mdx src/content/page/faq.mdx \
                src/content/page/terms.mdx src/content/page/privacy.mdx \
                src/content/blog/welcoming-the-month-of-ramadan.mdx \
                src/content/blog/what-zakat-means-in-our-community.mdx \
                src/content/blog/parenting-workshop-recap.mdx \
                src/content/blog/saturday-mornings-at-the-pantry.mdx \
                src/content/blog/notes-from-the-annual-gala.mdx  # -> 0
grep -c 'request our current phone number by emailing hello@mupla' \
       src/content/page/contact.mdx src/content/page/faq.mdx  # 2 + 2
grep -c 'request our mailing address by emailing hello@mupla' \
       src/content/page/contact.mdx  # 2
grep -c '\*\*Phone:\*\* please email hello@mupla' src/content/page/contact.mdx  # -> 0
pnpm astro check  # -> 0 errors on touched files
```

## Skill chain provenance

- **`writing-shape`** — explicit application: each touched file was treated as a fragment dump; thesis is "every comma sits one space from the next word, and every phone-number request is a complete verb-phrase sentence".
- **`brand`** — spot-check on every replacement. The rephrased "request our current phone number by emailing" reads as visitor copy, not maintainer copy. Ihsan-coded; no SaaS vocab.
- **`code-reviewer-minimax-m3`** — flagged (a) YAML frontmatter risk (verifier above proves it; double-quoted YAML keeps the post-sed string content safely), and (b) the partial phone-placeholder coverage; both closed in this pass entry.

## Ledger & filing

- `STATE.md` — `Last updated: pass 14.1 - 2026-07-07`; `## Predecessor chain` extended ` / 14.1`; `## Next pass (Pass 15)` unchanged (axe-core baseline + page-budget audit + contact-block rewire).
- `loop-run-log.md` — appended `## Pass 14.1 — 2026-07-07 (Pass 14 corrective: full-sweep + phone-placeholder rephrase)`.
- GH Issue #46 (the Pass 14 rollup) covers this corrective work; no new GH issue needed per the one-issue-per-pass cadence. Maintainer can move #46 from `needs-triage` to `ready-for-agent` once reviewed.

## Maintainer gates (HUMAN-ONLY per `docs/safety.md`)

- `bash bin/prep-push.sh` — to fast-forward `origin main` to the Pass 14 + Pass 14.1 commits once reviewed.
- (Same gates as Pass 14 brief: TTY-gated `bin/mcp-bootstrap.sh` + `scripts/axe-core.sh` after landing.)
- Optional followup (deferred): donor-tier drift in `donate.mdx` (`Companion` vs canonical `Supporter`) — future Pass 15 / 16 with maintainer confirmation.
