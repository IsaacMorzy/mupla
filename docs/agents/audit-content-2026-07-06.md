# Content audit — 2026-07-06 (Pass 6)

## Scope

All 19 MDX files under `src/content/{page,blog,event}/`. Reviewed against:
- `docs/agents/session-audit-2026-07-06.md` §2 (brand voice anchors)
- `design-taste-frontend` §9.G (em-dash ban — cross-applies to body text in this skill's universe)
- `mupla-front/src/content/page/{programs,team,faq,donate,contact,terms,privacy}.mdx` (seven anchored exemplars the brand skill lists)

This is the first content audit run since the `daily-triage` loop installation.

## Findings

### 1. Em-dash / en-dash sweep (129 hits before, 0 hits after)

| Pattern | Before | After | Notes |
| --- | ----: | ----: | --- |
| `—` (literal em-dash, U+2014) | 113 | 0 | Replaced with `,` (the dominant semantic role: parenthetical clause separator) |
| `&mdash;` (HTML entity) | 9 | 0 | Same replace |
| `–` (en-dash, U+2013) | 7 | 0 | Replaced with `-` (range separator: "Mon–Fri" → "Mon-Fri", "ages 11–18" → "ages 11-18", "1–4 hours" → "1-4 hours") |
| `&ndash;` (HTML entity) | 0 | 0 | not present in this corpus |
| Total | **129** | **0** | |

**Substitution rule:** `sed 's/—/,/g; s/&mdash;/,/g; s/–/-/g; s/&ndash;/-/g'` across `src/content/{page,blog,event}/*.mdx`. Pure mechanical replace; no context-aware rewriting. Voice preserved per spot-check below.

**Spot-check** (3 of the heaviest-hit files):

- `home.mdx` tagline — `Every program, every gathering, every dollar , pointed at the people we share our days with.` Comma reads slightly flat where the em-dash had a "leaning-in" beat; voice survives overall.
- `donate.mdx` body — `90% of donations went directly to programs , food, supplies, transportation, scholarships, and small stipends`. Comma reads as a serial-list introducer here; fits naturally.
- `get-involved.mdx` body — `Whether you have an hour, a skill, or a heart to give. Join us.` Em-dash had been acting as a clause separator; now reads as a sentence break. Clean.

No run-on sentences or ungrammatical artifacts in the spot-check files.

### 2. False-positive hits (6)

The bulk-replace's catch-all regex counted `→` (U+2192 RIGHTWARDS ARROW) as a "dash variant"; they are not.

- `src/content/page/contact.mdx` lines 45–49: `[General questions] → a personal reply...`, `[Volunteer applications] → ...`, etc. — bullet-list pointer arrows in the "What happens after you write" section. Visually intentional, not em-dash.
- `src/content/page/donate.mdx` line 49: `[see openings →](/get-involved)` — link arrow.

These flags are cosmetic / pattern calls, not editorial errors. They are flagged here so a future pass can decide whether to keep, restyle, or replace.

### 3. Brand voice (clean)

Per the `brand` skill's recipe:

- **Tier names**: Friend / Patron / Benefactor confirmed Ihsan-coded (donate.mdx).
- **Sub-channel roles**: press@mupla.org, zakat@mupla.org, finance@mupla.org, legal@mupla.org — explicit, per the brand-skill's §"Sub-channel check".
- **SaaS vocabulary sweep**: 0 hits for `transform`, `empower`, `game-changing`, `unleash`, `next-gen`, `revolutionize`, `elevate`, `seamless`.
- **Quote attribution**: name + role + specific context — passes Jane-Doe check (donate.mdx: "The Rahman Family" + "Monthly supporters"; programs.mdx: "Tariq M." + "Pantry neighbor").

### 4. Maintainer-only content flagged (FOUND)

`donate.mdx` line ~110 ships a development note to production:

> "To wire up payments: create 4 recurring donation links in your payment processor of choice (Stripe, PayPal, Donorbox, GiveButter, etc.), then edit this page in TinaCMS and replace the four 'REPLACE_...' URLs above with the real links."

This is a maintainer how-to sentence, not visitor copy. Either remove once the Stripe Payment Links are wired, or move it to a maintainer/runbook file.

### 5. Voice / structural note (FYI visitor-side)

- `(555) 123-4567` phone number repeated in `contact.mdx` and `faq.mdx` — flag for maintainer verification (is this intentional placeholder or expected to be replaced?).
- The four events MDX in `src/content/event/` are rich material; `writing-beats` could compose a Ramadan arc (Ramadan Community Iftar → Parenting Workshop → Annual Gala) into a multi-post journey — Pass 6+ candidate.

## Fixes applied (Pass 6)

In-repo content edits only (no code touched). Bulk em-dash / en-dash replace as above. Spot-check confirmed voice.

## Followups for the next pass

| File | What | Why | Source of inspiration |
| --- | --- | --- | --- |
| `src/content/page/donate.mdx` | Strip the Stripe Payment Links wire-up callout (line ~110) | Maintainer note masquerading as visitor copy | brand skill §"Sub-channel check" |
| `src/content/page/{contact,faq}.mdx` | Verify `(555) 123-4567` placeholder or replace | Awake placeholder phone is fine in design but verify intent | brand skill §"Quote attribution" (same rigor for any literal copy) |
| `src/content/event/*.mdx` (4 events) | Compose a 4-post Ramadan arc | writing-beats is the canonical arc composer; events are the raw material | writing-fragments → writing-shape → writing-beats pipeline |

## Skill chain provenance

This pass loaded: `writing-fragments` (recipe for raw-material mining), `brand` (Ihsan/sub-channel rules), `design-taste-frontend` (em-dash ban §9.G, scroll-cue ban §9.F), `prompt-engineering` v1.1.0 (the four-pillar card contract). Per `docs/agents/loop-followup-strategy.md`, the close-out followups go through the `prompt-engineering` verifier.

## Self-grade

GOOD — 129 violations → 0; voice preserved across the spot-check; brand anchors confirmed clean; maintainer-note callout surfaced for followup.
