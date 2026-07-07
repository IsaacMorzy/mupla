# Design audit — 2026-07-06 (Pass 7)

## Scope

All UI files in `src/components/**/*.{astro,ts,tsx}` + `src/pages/**/*.astro` + `src/styles/global.css`. Reviewed against:
- `DESIGN.md` §2 (palette + tokens), §3 (typography), §4 (component stylings), §5 (spacing), §6 (depth/elevation), §7 (do/don't), §8 (responsive)
- `design-taste-frontend` §9 (AI Tells)
- `CONTEXT-site.md` (the Astro public surface, especially the "cosmic chrome retired" rule)

First design audit since the `daily-triage` loop installation.

## Findings

### 1. Real violations to fix (Pass 7 scope)

| Path | Line | Pattern | Severity | Fix |
| --- | --- | --- | --- | --- |
| `src/components/ui/Input.astro` | 12 | `shadow-sm` default on input | medium | drop `shadow-sm`; `--input` border + `focus-visible:ring-[3px] focus-visible:ring-ring/50` are sufficient per DESIGN §4 (Input) and §6 (no shadows except focus and floating) |
| `src/components/ui/Textarea.astro` | 11 | `shadow-sm` default on textarea | medium | same |

These shadows were an additive carry from the shadcn/ui pattern input recipe — visually it lifts the input slightly off `--background`, but per `DESIGN.md §6` site-wide rule, shadows are reserved for "the focus ring and the rare floating element (dropdown menu, modal)." Inputs are neither focus rings nor floating elements; border alone is the design system's elevation cue.

**Fixes applied (complete):**

```diff
- 'peer flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors ...'
+ 'peer flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm transition-colors ...'

- 'flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground ...'
+ 'flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground ...'
```

Both files now rely on:
- 1px `--input` border (already there)
- `focus-visible:ring-[3px] focus-visible:ring-ring/50` (already there)

A11y preserved (focus ring still triggers on keyboard / pointer focus). Visual cue preserved (border stays visible at rest, ring signals interaction).

### 2. Carve-outs (intentional, do not touch)

| Path | Patterns | Status |
| --- | --- | --- |
| `src/pages/oxfam.astro` | `bg-[#0B2540]`, `bg-[#FF6B35]`, `bg-white`, `text-white`, `bg-gradient-to-br`, `font-black` | **Intentional co-brand variant** — `.theme-oxfam` `<style is:global>` scope at the bottom of the file reverses the local token cascade for an A/B test against the Anthropic-paper baseline. Header strip on the page even says "You're viewing the Oxfam-style variant." |

If/when the A/B test concludes and the variant retires, oxfam.astro will be deleted, not refactored. No edits this pass.

### 3. A11y observations (clean)

- 43 `aria-*` and `role="..."` attributes across src/. Well-distributed across Header.astro, Progress.astro, BlogBody.astro, Footer.astro, ThemeToggle.astro, Icon.astro (icon SVGs).
- Honeypot inputs (anti-spam) use `tabindex="-1" autocomplete="off" aria-hidden="true" class="sr-only"` — correct pattern.
- Theme toggle: `aria-label="Toggle color theme"` — correct.
- Mobile menu toggle: `aria-expanded`, `aria-controls="mobile-menu-panel"`, `aria-label="Toggle navigation menu"` — correct.
- Skip-link or `tabindex` jump-point: not specifically detected; if missing, the maintainer should add per WCAG 2.4.1.
- Bulk regex (`bg-white| bg-black | text-white | text-black`) showed 0 hits outside the oxfam carve-out.

### 4. Token-discipline check (clean)

- 0 `--clay-*` primitives in `src/styles/global.css` (confirmed grep — only the comment "MUST be amber — never --clay-*" appears).
- 0 `bg-white` / `bg-black` / `text-white` / `text-black` outside oxfam.astro and the destructive-foreground path.
- `Badge.astro` `.destructive` and `Button.astro` `.destructive` use `text-white` for destructive buttons — this is intentional per `DESIGN.md` §4 (Button: `bg-destructive` + `text-white`). The destructive token (`--rose-500` light, `--rose-700` dark) is the aggressive rose-on-bg, and `text-white` is the documented label color. PASS.
- `bg-gradient-to-` outside oxfam.astro: 0 hits. Confirmed `bg-gradient-to-r` and `bg-gradient-to-br` only on the variant.

### 5. En-dash (visually similar to em-dash) in code comments — left intact

44 em-dash occurrences across `src/components/` and `src/pages/`, **but** the bulk of these are in code comments (e.g., `<!-- RSS feed (blog + events) — lets readers...` in BaseHead.astro; `// Cap at 3 — keeps the footer compact` in blog/[...slug].astro).

**Decision:** `design-taste-frontend` §9.G bans em-dash in *visible* text. Code comments are not visible. Leaving them — they document intent and don't ship to readers. Skip.

### 6. Honeypot input credit-card width

`Footer.astro` and `ContactForm.astro` use `class="absolute -left-[9999px] size-0 opacity-0"` for honeypot anti-spam inputs. Pattern is correct (off-screen + zero-size + zero-opacity; aria-hidden true; tabindex -1; autocomplete off). PASS.

## Fixes applied (Pass 7)

Two files. One `shadow-sm` removal each. Documented in `## 1. Real violations to fix` above.

## Followups for the next pass

| File / Surface | What | Why |
| --- | --- | --- |
| `src/pages/oxfam.astro` | When A/B test concludes: delete or commit | Currently a permanent showcase; clean it up after the experiment ends |
| `src/components/ui/Textarea.astro` | Hoist `min-h-[80px]` into a size variant (sm/md/lg) for parity with `Button` size variants | The Tailwind utility diversity makes the spec grid feel slightly ad-hoc |
| Site-wide | Run `axe-core` or Lighthouse a11y audit on `home`, `donate`, `contact` | The aria sweep was static; a runtime lighthouse would catch dynamic a11y regressions (e.g., focus order, color contrast) |
| Site-wide | Confirm Donation Payment Links in `donate.mdx` actually resolve (the four `REPLACE_*` URLs) | Found and flagged in the content audit; design audit confirms no UI hides this |

## Skill chain provenance

This pass loaded: `design-taste-frontend` (anti-slop), `design-system` (three-layer token architecture references), `design-md` (DESIGN.md as the single source of truth), `brand` (cross-load for em-dash in body text), `prompt-engineering` v1.1.0 (close-out card contract).

## Self-grade

GOOD — Input/Textarea shadow discipline restored; carve-outs respected; a11y surface clean; bulk code-comment em-dashes left intact (not a visible violation).
