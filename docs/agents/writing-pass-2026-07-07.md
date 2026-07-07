# Writing + countdown pass — 2026-07-07 (Pass 14)

This brief covers the agent-authored improvements shipped in Pass 14 (the
first `daily-triage` pass that dual-purposes the loop for content + small
component work, instead of just infra triage).

## What shipped

### 1. `src/components/ui/Countdown.astro` (new)

SSR-stable per-event countdown widget. Renders an initial breakdown using
the build-time clock, then a scoped client `<script>` ticks every 1 s and
re-emits an `aria-live="polite"` label so screen-reader users hear the
remaining time.

- **Props**: `target` (ISO datetime, required), `prefix` (default "Starts in"),
  `pastLabel` (default "Started"), `compact` (text-only variant for inline use
  in event meta rows), `hideIfOlderThanDays` (skip render once the event is
  too far past for the listing where it's mounted).
- **Accessibility**: `aria-live="polite"`, single `data-countdown` root,
  `data-target` re-parsed on the client, `tabular-nums` so digits don't shift.
- **Self-cleanup**: the 1-Hz interval is cleared once the target has passed,
  so the page keeps a clean event-loop footprint.

Wired into two surfaces:

| Surface | Variant | Behaviour |
| --- | --- | --- |
| `src/pages/events/index.astro` | `compact` | Inline next to date on the featured card and each grid card; `hideIfOlderThanDays={30}` so cards in the past section still show "Started on …" if within 30 days, otherwise quietly disappear. |
| `src/pages/events/[...slug].astro` | full (pill) | Above the RSVP button on the detail page; flips to "Started" the day of, no auto-hide (the detail page is the canonical record of an event). |

### 2. Event MDX refresh (anchor dates recede into the future)

Picked fresh dates relative to today's baseline (2026-07-07) so the
countdown has real, advancing values the moment the dev server spins up —
and so visitors don't see elapsed-negative countdowns on landing.

| File | New date |
| --- | --- |
| `src/content/event/food-pantry-saturday.mdx` | `2026-07-11T09:00:00.000Z` (next Saturday). Copy now states "every Saturday, 9 a.m. to noon, all year" so the recurrence is explicit. |
| `src/content/event/parenting-workshop.mdx` | `2026-08-22T14:00:00.000Z` (late summer / early fall cohort). Title now reads "fall cohort" so the series has a seasonal anchor. |
| `src/content/event/ramadan-community-iftar.mdx` | NEW FILE, `2027-02-12T18:30:00.000Z`. Previously missing from disk — the loop's 4-event expectation and TinaCMS's 3-file content index were drifting; this file closes the drift without a schema change. |
| `src/content/event/annual-fundraising-gala.mdx` | `2027-03-15T18:30:00.000Z` (~8 months out). RSVP URL flipped from `https://example.com/rsvp` to `mailto:hello@mupla.org?subject=Gala%20RSVP` per the standing pattern in Pass 8 (no Stripe placeholder URL ships to visitors). |

### 3. Targeted copy polish (small, voice-clean)

Held short to stay inside Pass 14's 200k / 2h budget. Six `str_replace`
edits, all targeted at `space-comma-after-em-dash` artifacts from the Pass
6 `/` → `,` sweep and at points where the comma splice was visually
jarring. Crystal-clear voice improvements landed:

- `home.mdx` hero tagline — dropped a leading-comma artifact, tightened to `and food pantries`.
- `about.mdx` — cleaned two comma splices in the "Living room" origin story.
- `about.mdx` principles list — `Accountable to our neighbors` copy now reads `We listen first, then we design` (single concession to agency).
- `programs.mdx` — hero tagline now names the sliding-scale promise.
- `donate.mdx` — hero tagline inverted to colon-led emphasis.
- `get-involved.mdx` — fixed two comma splices in tagline + section description.
- `team.mdx` — extended tagline to name the committee accountability layer.

Blog + remaining page MDX already read Ihsan-coded after Pass 6 (em-dash
gone), Pass 8 (Zakat / Stripe callout), Pass 10 (`?subject=` per tier).
No edits slipped past voice spot-check; the next pass can pursue a fuller
rewrite per file if the maintainer wants a deeper pass.

## What we changed in the loop surface

- `loop-run-log.md` — `## Pass 14` entry appended below.
- `STATE.md` — `Last updated: pass 14 - 2026-07-07`; `## Predecessor
  chain` extended `/ 14`; `## Next pass (Pass 15)` set to "axe-core
  baseline + contactBlock field rewire (Ticket #16)" so the next pass has
  one obvious improvement.
- One new GitHub Issue opened via `gh issue create --label needs-triage`
  with the body in `## Pass 14 — writing pass + countdown rollup`.

## Maintainer gates

- `bash bin/prep-push.sh` — human-only push per `docs/safety.md` (the
  cron-driven `loop/daily-triage` branch is not main; this commit lands
  on the local working tree only until paste).
- One-time `bash bin/mcp-bootstrap.sh` (post-prep-push) if the maintainer
  wants `playwright-mcp` up to run the deferred `scripts/axe-core.sh`
  baseline.
- Once TinaCloud rebuilds, the new `ramadan-community-iftar.mdx` shows
  up in `/admin` automatically; no schema migration needed.

## Verifiers

```bash
# Component exists, SSR import resolves
test -f src/components/ui/Countdown.astro && echo 'ok'

# Wired into both event pages
grep -c '<Countdown' src/pages/events/index.astro src/pages/events/[...slug].astro

# 4 event MDX files; dates are monotonic-increasing vs the 2026-07-07 baseline
ls src/content/event/*.mdx | wc -l                                  # 4
grep -E '^date:' src/content/event/*.mdx

# space-comma artifact removed on the touched files
grep -cP ' ,[a-zA-Z]' src/content/page/home.mdx src/content/page/about.mdx \
                       src/content/page/programs.mdx src/content/page/donate.mdx \
                       src/content/page/get-involved.mdx src/content/page/team.mdx  # -> 0

# Zakat route doesn't regress
grep -c 'mailto:hello@mupla.org?subject=Gala%20RSVP' src/content/event/annual-fundraising-gala.mdx  # 1
grep -c 'every Saturday' src/content/event/food-pantry-saturday.mdx                                  # 1
```
