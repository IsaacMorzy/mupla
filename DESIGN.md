# DESIGN.md — mupla-front

> Design system source of truth for the mupla foundation site (Astro 6 + Tailwind v4 + TinaCMS). Format adapted from [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md). Read by AI coding agents to generate UI that matches the brand.

---

## 1. Visual Theme & Atmosphere

**Mood:** Sincere, editorial, community-trustworthy. Sits between a long-form magazine and a mosque brochure — never SaaS, never consumer-app.

**Density:** Generous whitespace. Long line lengths for prose, tight for UI chrome. The site reads at print scale; it does not feel like a dashboard.

**Design philosophy:**
- **Warm over cold** — every surface carries a paper-like warmth (hue ~75, low chroma). No cool greys, no pure white, no pure black.
- **Serif-first typography** — headings use a Charter/Iowan Old Style/Georgia stack. Inter is reserved for UI and body where readability at small sizes matters more than voice.
- **Restrained chroma** — the only saturated color is the primary accent. Everything else is near-neutral. When in doubt, drop the chroma.
- **Cultural resonance without stereotype** — the palette draws from Islamic illumination manuscripts and lantern light, not from crescent moons or arabesque clipart. The site looks like a foundation that happens to be Muslim, not a "Muslim-themed" site.

**Anti-mood:** gradient-heavy, glassmorphism, neon accents, dark-mode-by-default, emoji-as-icon, drop shadows under every card.

---

## 2. Color Palette & Roles

All values in OKLCH (perceptual, theme-portable). Tokens live in `src/styles/global.css`. Three layers: **primitives** (raw OKLCH values, mode-agnostic) → **semantic** (purpose-bound aliases) → **component** (Tailwind class bindings via `@theme inline`). Primitives are the source of truth for new color decisions; semantic aliases are what UI code consumes.

### Primitive scale

Mode-agnostic OKLCH values defined once in `:root` and consumed by both light and dark semantic aliases. Naming follows Tailwind's `scale-N` lightness steps; intermediates (`--paper-75`, `--paper-alpha-N`, `--night-900`) are added where needed.

| Primitive | OKLCH | Role |
|---|---|---|
| `--paper-50` | `oklch(0.985 0.008 75)` | Light page canvas (warm ivory) |
| `--paper-75` | `oklch(0.95 0.012 75)` | Dark foreground (off-white) |
| `--paper-100` | `oklch(0.94 0.012 75)` | Light quiet surface (secondary / muted) |
| `--paper-200` | `oklch(0.88 0.015 75)` | Light hairline (border / input) |
| `--paper-700` | `oklch(0.5 0.025 60)` | Light secondary text (captions, metadata) |
| `--paper-800` | `oklch(0.34 0.03 60)` | Light secondary-foreground |
| `--paper-900` | `oklch(0.26 0.025 60)` | Light body text (deep sepia). WCAG AA on `--paper-50`. |
| `--night-900` | `oklch(0.2 0.018 60)` | Dark page canvas (deep sepia, not `#000`) |
| `--paper-alpha-14` | `oklch(0.95 0.012 75 / 14%)` | Dark hairline (additive white) |
| `--paper-alpha-18` | `oklch(0.95 0.012 75 / 18%)` | Dark input stroke (additive white) |
| `--amber-500` | `oklch(0.62 0.12 78)` | **Primary light — SHIPPED amber/gold** |
| `--amber-700` | `oklch(0.8 0.11 80)` | Primary dark (lighter amber that pops on sepia) |
| `--rose-500` | `oklch(0.55 0.15 22)` | Destructive light (rose, not clay) |
| `--rose-700` | `oklch(0.65 0.16 22)` | Destructive dark |
| `--chart-warm-1` | `oklch(0.7 0.13 78)` | Warm chart spectrum step 1 |
| `--chart-warm-2` | `oklch(0.55 0.1 75)` | step 2 |
| `--chart-warm-3` | `oklch(0.4 0.05 50)` | step 3 |
| `--chart-warm-4` | `oklch(0.78 0.13 75)` | step 4 |
| `--chart-warm-5` | `oklch(0.68 0.13 30)` | step 5 |

`--chart-warm-1..5` are the same warm spectrum in both modes by design (see functional rules below).

### Semantic mapping — light mode (`Anthropic-paper`)

| Semantic | Resolves to | Notes |
|---|---|---|
| `--background` | `var(--paper-50)` | Page canvas |
| `--foreground` | `var(--paper-900)` | Body text — WCAG AA on `--paper-50` |
| `--card` | `oklch(0.995 0.006 75)` | One step lighter than background (inline near-tint) |
| `--card-foreground` | `var(--paper-900)` | |
| `--popover` | `oklch(0.995 0.006 75)` | Same as card |
| `--popover-foreground` | `var(--paper-900)` | |
| `--primary` | `var(--amber-500)` | **Primary accent** — amber/gold (shipped, not pending) |
| `--primary-foreground` | `var(--paper-50)` | |
| `--secondary` | `var(--paper-100)` | |
| `--secondary-foreground` | `var(--paper-800)` | |
| `--muted` | `var(--paper-100)` | |
| `--muted-foreground` | `var(--paper-700)` | |
| `--accent` | `oklch(0.92 0.025 50)` | Warm hover (inline — not on a scale) |
| `--accent-foreground` | `oklch(0.3 0.04 50)` | |
| `--destructive` | `var(--rose-500)` | |
| `--border` | `var(--paper-200)` | |
| `--input` | `var(--paper-200)` | |
| `--ring` | `var(--amber-500)` | Matches primary |
| `--chart-1..5` | `var(--chart-warm-1..5)` | Warm spectrum (identical in dark mode) |

### Semantic mapping — dark mode (sepia night)

| Semantic | Resolves to | Notes |
|---|---|---|
| `--background` | `var(--night-900)` | Deep sepia (not `#000`) |
| `--foreground` | `var(--paper-75)` | Warm off-white |
| `--card` | `oklch(0.24 0.022 60)` | One step lighter than background (inline near-tint) |
| `--card-foreground` | `var(--paper-75)` | |
| `--popover` | `oklch(0.24 0.022 60)` | Same as card |
| `--popover-foreground` | `var(--paper-75)` | |
| `--primary` | `var(--amber-700)` | **Primary accent** — amber/gold, dark side |
| `--primary-foreground` | `var(--night-900)` | Inverted |
| `--secondary` | `oklch(0.3 0.03 60)` | Darker than card (inline) |
| `--secondary-foreground` | `var(--paper-75)` | |
| `--muted` | `oklch(0.3 0.03 60)` | |
| `--muted-foreground` | `oklch(0.72 0.025 65)` | Slightly desaturated foreground (inline) |
| `--accent` | `oklch(0.32 0.04 50)` | Dark warm hover (inline) |
| `--accent-foreground` | `var(--paper-75)` | |
| `--destructive` | `var(--rose-700)` | |
| `--border` | `var(--paper-alpha-14)` | Hairline |
| `--input` | `var(--paper-alpha-18)` | |
| `--ring` | `var(--amber-700)` | Matches primary |

### Functional rules
- **Never** use the primary color for body text — only for links, CTAs, focus rings, and key accents.
- **Never** use pure black (`#000`) or pure white (`#fff`). Always tinted.
- **Charts** use a 5-step warm spectrum (`--chart-1..5` alias `--chart-warm-1..5`), not a rainbow palette.
- **NEVER alias `--clay-*` to anything.** The shipped primary is amber/gold; clay was a stale reference from the pre-amber documentation. If you find any `--clay-*` primitive in `global.css`, that's a bug.

---

## 3. Typography Rules

### Font stacks

| Role | Stack | Source |
|------|-------|--------|
| Sans (UI, body) | `'Inter Variable', 'Inter Fallback', system-ui, sans-serif` | `@fontsource-variable/inter` (npm) + metric-matched Arial fallback |
| Serif (headings, prose) | `'Charter', 'Iowan Old Style', 'Apple Garamond', 'Serif Fallback', ui-serif, Georgia, serif` | System serifs only — no extra `@fontsource` package, no network fetch |

### Hierarchy

| Level | Font | Size (mobile → desktop) | Weight | Tracking |
|-------|------|------------------------|--------|----------|
| `h1` (Hero) | serif | `text-6xl md:text-7xl xl:text-[5.25rem]` | `font-medium` (500) | `-0.005em` letter-spacing |
| `h2` | serif | `text-4xl md:text-5xl` | `font-medium` (500) | `-0.005em` letter-spacing |
| `h3` | serif | `text-2xl md:text-3xl` | `font-medium` (500) | `-0.005em` letter-spacing |
| Body | sans | `text-base` (16px) | `font-normal` (400) | default |
| Small / caption | sans | `text-sm` (14px) | `font-normal` | default |
| Eyebrow | sans, uppercase | `text-xs` (12px) | `font-medium` (500) | `tracking-wider` |

### Rules
- Headings default to serif (`h1, h2, h3` in `@layer base`). Per-component overrides are allowed (e.g., Hero h1 uses serif by default but can switch to sans for a utility feel).
- **CLS-safe fallbacks**: both stacks use `ascent-override`, `descent-override`, `line-gap-override`, and `size-adjust` so the Inter and Arial metrics match. Do not remove the `@font-face` blocks without re-checking layout shift.
- No more than **2 weights per page** (typically 400 + 600). 500 is reserved for serif headings.

---

## 4. Component Stylings

### Button

Built with `tailwind-variants` (`src/components/ui/Button.astro`). All sizes use `rounded-lg`.

| Variant | Background | Text | Notes |
|---------|-----------|------|-------|
| `default` | `bg-primary` | `text-primary-foreground` | Primary CTA |
| `destructive` | `bg-destructive` | `text-white` | Destructive actions |
| `outline` | `bg-background` | `text-foreground` | + `border` on hover `bg-accent` |
| `secondary` | `bg-secondary` | `text-secondary-foreground` | Quieter CTA |
| `ghost` | transparent | `text-foreground` | + hover `bg-accent` |
| `link` | transparent | `text-primary` | `underline-offset-4 hover:underline` |

| Size | Height | Padding | Notes |
|------|--------|---------|-------|
| `sm` | `h-8` | `px-3 gap-1.5` | Inline with text |
| `default` | `h-9` | `px-4 py-2` | Standard |
| `lg` | `h-10` | `px-6` | Hero CTA |
| `icon` | `size-9` | — | Square icon button |

**Focus:** `focus-visible:ring-[3px] focus-visible:ring-ring/50` (no shadow by default).
**Disabled:** `disabled:pointer-events-none disabled:opacity-50`.

### Card

`src/components/ui/Card.astro` — `bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border/60 py-6`

- Background: `--card`
- Border: 1px `--border` at 60% opacity (`border-border/60`) — no shadow by default
- Padding: `py-6` (no horizontal padding — card fills its container)
- Layout: `flex flex-col gap-6`
- Rounded: `rounded-xl`

Companion components: `CardHeader.astro` (title + description), `CardContent.astro` (body slot).

### Input

*No dedicated Input component yet.* Form controls are inlined in their consuming blocks. If/when one is added, it should:
- Background: `--background`
- Border: 1px `--input`
- Focus ring: `focus-visible:ring-[3px] focus-visible:ring-ring/50` (matches Button)
- Rounded: `rounded-lg` (matches Button default)

### Navigation (Header)

- Sticky top, `h-16` (64px)
- Background: `--background` with `backdrop-blur` and 80% opacity (only when scrolled; solid at top)
- Border-bottom: 1px `--border`
- Logo: serif wordmark, `text-lg font-semibold`
- Nav links: `text-sm font-medium`, hover color `--primary`

### Section wrapper

`src/components/ui/Section.astro` — wraps every block. Single canonical vertical rhythm.

- Outer wrapper: optional `background` prop (default `bg-default`)
- Inner section: `py-12 mx-auto max-w-7xl px-6`
- Vertical rhythm: `py-12` (64px). *Not* the more generous `py-16 md:py-24` — blocks compose vertically for visual separation.
- Horizontal: `px-6` (uniform — no mobile/desktop split)
- Max-width: `max-w-7xl` (single value for all sections)

---

## 5. Layout Principles

### Spacing scale

Tailwind v4 default scale (0.25rem = 4px base). The site uses a **4px grid** — every margin, padding, and gap is a multiple of 4. No `p-[13px]` or `mt-[7px]`.

Common patterns:
- `gap-2` (8px) — tight UI (icon + label)
- `gap-4` (16px) — default between related elements
- `gap-8` (32px) — between sections of a card
- `py-12` (48px) — the canonical Section vertical rhythm (see §4)

### Grid

- 12-column at `lg`+ (1024px+)
- 6-column at `md` (768px+)
- 4-column at `sm` (640px+)
- Stack to single column below `sm`

### Whitespace philosophy

- **Above the fold** should never be busy. The Hero gets ~70% of the first viewport to itself.
- **Prose** (blog body) uses `max-w-prose` (65ch) and generous `leading-relaxed` (1.625).
- **Cards** get breathing room — never flush against each other without at least `gap-4`.

---

## 6. Depth & Elevation

The site uses **surface tinting, not shadows**, to convey hierarchy. The card surface is one step lighter than the background; the muted surface is one step darker. Shadows are reserved for one thing: the focus ring and the rare floating element (dropdown menu, modal).

| Level | Technique |
|-------|-----------|
| 0 (page) | `--background` |
| 1 (card) | `--card` (one step lighter than bg) |
| 2 (muted / code) | `--muted` |
| 3 (floating) | `--popover` + `shadow-lg` (dropdowns, modals only) |

No `shadow-md` on cards. No `shadow-xl` on hover. If you need elevation, change the surface, don't add a shadow.

---

## 7. Do's and Don'ts

### Do
- ✅ Tint every neutral with warm hue (60-75). Never `#000`, `#fff`, `#666`, `#eee`.
- ✅ Use serif for headings to signal "editorial/community".
- ✅ Keep the primary accent for links, CTAs, and key moments only.
- ✅ Use OKLCH for all new color tokens (perceptual, theme-portable).
- ✅ Test both light and dark mode for every new component.
- ✅ Use the existing `Section`, `Button`, `Card` primitives before building new ones.

### Don't
- ❌ Add new fonts. The serif stack is system-only by design (no extra `@fontsource` package).
- ❌ Use gradients on backgrounds. The warm tint is enough.
- ❌ Use `bg-white` or `bg-black`. Use the semantic tokens.
- ❌ Add shadows to cards. Use surface tinting.
- ❌ Use green/emerald as a primary — it reads as "Muslim-themed site" too literally and fights the editorial tone.
- ❌ Reintroduce the retired cosmic-chrome elements (`<Aurora />`, `<Starfield />`, `starfield` Hero field) — they were removed in the Anthropic-paper redesign. See `CONTEXT-site.md`.
- ❌ Use emoji as icons. Use `@iconify-json/tabler` via `astro-icon`.

---

## 8. Responsive Behavior

### Breakpoints

| Name | Min-width | Use |
|------|-----------|-----|
| `sm` | 640px | Stack collapses to 1 column above this |
| `md` | 768px | 2-column grids kick in, Hero sizing changes |
| `lg` | 1024px | 3+ column grids, full nav |
| `xl` | 1280px | Hero reaches max display size |

### Touch targets

- Minimum 44×44px on mobile (per WCAG 2.5.5)
- Buttons use `size="lg"` (`h-10`) for primary CTAs; minimum 44px on the largest tap zone is hit via `px-6` + content width

### Collapsing strategy

- **Navigation**: full nav at `md+`, hamburger below
- **Hero image**: full circle at `md+` (size-72), smaller (size-56) below
- **Feature/Stats grids**: 3-col at `md+`, 1-col below
- **Blog prose**: same `max-w-prose` at all sizes; only horizontal padding changes

---

## 9. Keyboard Navigation

The site should be fully navigable via keyboard:

### Focus management
- All interactive elements (links, buttons, form controls) must have visible `:focus-visible` rings (3px, `--ring` at 50% opacity, consistent with Button §4).
- Focus order must follow visual order (DOM order = reading order). No `tabindex` values above 0.
- Skip-to-content link at the top of every page (hidden until focused, skips to `<main>`).
- Nav menus that open on hover (e.g., dropdown nav) must also open on `:focus-within`.

### Keyboard traps
- No component may trap focus without an explicit escape mechanism (`Escape` key).
- Modals/dialogs (when added) must trap focus, close on `Escape`, and restore focus to the triggering element on close.
- CSS-only `<details>` accordions (§11) are natively keyboard-accessible (Space/Enter to toggle) — no extra JS needed.

### Tab order
- Tab from skip-link → header nav → main content → footer → back to browser chrome.
- Links that open new tabs must have `rel="noopener noreferrer"` and, where appropriate, `target="_blank"` with a visible or `aria-label` indicator.

### Testing
- On every new component, verify: all interactive elements are reachable via Tab, all have visible focus indicators, and Escape dismisses any overlay.
- Use axe-core or Lighthouse keyboard audit as part of the CI pipeline (`scripts/axe-core.sh`).

---

## 10. Agent Prompt Guide

When asking an AI agent to build or modify UI in this project, include this block in the prompt:

```text
Read /DESIGN.md first. Use the Anthropic-paper warm palette (OKLCH, hue 60-75,
no pure black/white). The current primary is amber/gold (`--amber-500` light,
`--amber-700` dark) — see §11 for rationale and §2 for the token mapping.
Headings are serif (Charter/Iowan/Georgia stack); UI is Inter. Restrained
chroma — only the amber/gold accent is saturated. Use surface tinting for
hierarchy, not shadows. No gradients, no green/emerald, no reintroduced
cosmic-chrome elements. Buttons default to rounded-lg. Section vertical
rhythm is py-12 (blocks compose vertically for separation). Test in both
light and dark mode.
```

### Quick color reference (for one-off prompts)

- Background: warm ivory `oklch(0.985 0.008 75)` (`--paper-50`)
- Foreground: deep sepia `oklch(0.26 0.025 60)` (`--paper-900`)
- Primary (light): amber/gold `oklch(0.62 0.12 78)` (`--amber-500`) — shipped, see §10
- Primary (dark): `oklch(0.8 0.11 80)` (`--amber-700`)
- Border: warm hairline `oklch(0.88 0.015 75)` (`--paper-200`)
- Destructive (light): rose `oklch(0.55 0.15 22)` (`--rose-500`)
- Serif headings, Inter body, never both at the same weight on the same line

---

## 11. Shipped Direction: Amber/Gold Primary (Muslim Theme)

The site's primary sits in a warm amber/gold family — the same warm hues the rest of the palette lives in. The shift from a generic muted clay to amber was a single-hue refinement, not a rebrand; the move carried cultural resonance from Islamic illumination manuscripts and lantern light.

### Current values (live in `src/styles/global.css`)

```css
/* Light */
--primary: oklch(0.62 0.12 78);   /* --amber-500 */
--ring:    oklch(0.62 0.12 78);

/* Dark */
--primary: oklch(0.8 0.11 80);    /* --amber-700 — pops on sepia */
--ring:    oklch(0.8 0.11 80);

/* Charts — same warm spectrum, hue 78 */
--chart-1: oklch(0.7 0.13 78);    /* --chart-warm-1 */
--chart-4: oklch(0.78 0.13 75);   /* --chart-warm-4 */
```

### Why amber, not alternatives

- **Stays in the warm hue family** the site already lives in (background hue 75, border hue 75). No jarring cool/warm contrast.
- **Culturally resonant** without being literal: gold leaf on Qur'anic pages, lantern light, the warmth of mosque interiors at sunset.
- **Works in both modes** — the dark-mode amber at L=0.8 pops on the sepia background; the light-mode amber at L=0.62 is muted enough to not feel luxurious.
- **Avoids the green/emerald trap** that signals "Muslim-themed site" too literally and fights the editorial tone.

### If you want bolder

Peacock teal (hue 200, the most iconic Islamic-coded non-green) requires shifting the background from warm to neutral. Save that for a future rebrand, not a primary-token swap. The current amber/gold is the live direction until the editorial positioning changes.

---

## 12. Component Inventory

The UI primitives actually shipped (in `src/components/ui/`). All follow the shadcn/ui pattern (cn utility + `tailwind-variants` + existing tokens), adapted as `.astro` files (no React runtime).

### Primitives (in use)

| Component | File | Purpose | API notes |
|-----------|------|---------|-----------|
| `Button` | `Button.astro` | All CTAs, links, icon buttons | 6 variants × 4 sizes, via `tailwind-variants` |
| `Card` | `Card.astro` | Generic content surface | `bg-card border-border/60 rounded-xl py-6 flex flex-col gap-6` |
| `CardHeader` | `CardHeader.astro` | Title + description for `Card` | |
| `CardContent` | `CardContent.astro` | Body slot for `Card` | |
| `Section` | `Section.astro` | Vertical rhythm wrapper — every block uses it | `py-12 mx-auto max-w-7xl px-6` |
| `Icon` | `Icon.astro` | `@iconify-json/tabler` via `astro-icon` | |
| `Avatar` | `Avatar.astro` | Round profile image | |
| `YouTubeFacade` | `YouTubeFacade.astro` | Lazy-loaded YouTube embed (performance) | |
| `ThemeToggle` | `../ThemeToggle.astro` | `.dark` class flipper | |
| `Header` / `Footer` | `../Header.astro` / `../Footer.astro` | Page chrome | |

### Form components (added in shadcn pass)

| Component | File | Purpose |
|-----------|------|---------|
| `Input` | `Input.astro` | Text/number/email/etc. inputs. Has `peer` class so `Label.astro` `peer-disabled` works. |
| `Textarea` | `Textarea.astro` | Multi-line text input |
| `Label` | `Label.astro` | Form label; uses `peer-disabled` so disabling the linked input dims the label |

### Feedback & state (added in shadcn pass)

| Component | File | Purpose |
|-----------|------|---------|
| `Badge` | `Badge.astro` | Tags, categories, status pills. 4 variants: `default`, `secondary`, `destructive`, `outline` |
| `Alert` | `Alert.astro` | Inline message (info / error). Pair with `AlertTitle` + `AlertDescription` |
| `AlertTitle` | `AlertTitle.astro` | Bold heading inside `Alert` |
| `AlertDescription` | `AlertDescription.astro` | Body text inside `Alert` |
| `Progress` | `Progress.astro` | 0–100% bar (donation progress, form steps, loading). Uses inline `width` style — intentional, not a bug. |
| `Skeleton` | `Skeleton.astro` | Animated loading placeholder (`animate-pulse bg-muted`) |
| `Separator` | `Separator.astro` | Visual break (`<hr>`), horizontal or vertical |

### Disclosure (added in shadcn pass)

| Component | File | Purpose |
|-----------|------|---------|
| `Accordion` | `Accordion.astro` | Root `<details>` (CSS-only, no JS). Has `group` class for `group-open:*` |
| `AccordionItem` | `AccordionItem.astro` | Single item (div with `border-b`) |
| `AccordionTrigger` | `AccordionTrigger.astro` | `<summary>` with chevron that rotates on open |
| `AccordionContent` | `AccordionContent.astro` | Collapsible body. Uses `grid-rows-[0fr] → grid-rows-[1fr]` transition (requires Chrome 117+ / Firefox 121+ / Safari 17.4+; older browsers snap). **Limitation:** CSS-only `<details>` can't do single-mode (exclusive open) — if you need that, add a tiny script that toggles `open` on siblings. |

### Not yet added (consider for a future pass)

- `Dialog` / `Sheet` — modals & slide-over panels. Needs JS (focus trap, escape key). Consider as Astro island with vanilla JS or `@radix-ui/react-dialog` wrapped in a React island.
- `Tabs` — needs JS for state management.
- `Tooltip` / `Popover` / `Dropdown Menu` — needs JS (positioning, dismissal).
- `Sonner` / `Toast` — needs JS (queue, auto-dismiss).
- `Select` / `Combobox` / `Checkbox` / `RadioGroup` / `Switch` — form controls that need JS for state.

These were deferred because the site is mostly static content and forms are rare. Add them when a concrete use case appears — don't add them speculatively.

## 13. Skills & References

This DESIGN.md is designed to be read by AI agents. The following skills (installed globally for Codebuff) provide deeper guidance:

### Design skills
- **`design-system`** — three-layer token architecture (primitive → semantic → component). Use this when adding new tokens.
- **`ui-styling`** — shadcn/ui + Tailwind v4 patterns. Use this when adding new components.
- **`brand`** — brand voice and messaging. Use this when writing copy that needs to match the tone.
- **`slides`** — for any presentation exports.
- **`design-md`** (this format) — keep this file in sync with `src/styles/global.css`. When tokens change in code, update §2 here. When new components are added, update §4 + §11.

### Engineering workflow skills (Matt Pocock-style)
- **`setup-matt-pocock-skills`** — already configured for this repo (see `docs/agents/`).
- **`triage`** — move issues through the state machine (`needs-triage` → `ready-for-agent` / `wontfix`). The five canonical labels live in `docs/agents/triage-labels.md`.
- **`to-issues`** — break a plan into independently-grabbable issues on the tracker.
- **`to-prd`** — synthesize a conversation into a PRD.
- **`improve-codebase-architecture`** — scan for deepening opportunities, present as a visual report.
- **`diagnosing-bugs`** — for hard bugs and performance regressions.
- **`qa`** — file bugs conversationally.

### Project context docs (read alongside this)

- `CONTEXT-site.md` — the Astro public surface, block inventory, and the "Anthropic-paper" rename history. Read this before any site-wide visual change.
- `CONTEXT-cms.md` — TinaCMS content model. The visual primitives here are the *only* layout primitives the CMS exposes to editors.
- `AGENTS.md` — agent workflow conventions for this repo.
