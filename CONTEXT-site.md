# Site context — the Astro public surface

This is the "what visitors see" side of the mupla foundation website. Editors compose it via Tina; Astro 6 + Tailwind v4 renders it.

## Domain primitives

- **Page** (`src/content/page/<slug>.mdx`) — a top-level routable page. Each page has an SEO title and a list of Page Sections (blocks).
- **Block** — a Tina template that renders a section of a page. Hero, Callout, Features, Stats, Cta, Content, Testimonial, Video, Split live at `src/components/blocks/<name>.astro` with their schema at `<name>.template.ts`. Adding a block means touching three files: `<name>.astro`, `<name>.template.ts`, and the templates array in `tina/collections/page.ts`.
- **Design tokens** (`src/styles/global.css`) — three layers:
  - `@theme inline` — semantic Tailwind variables (`--color-*`, `--radius-*`, `--font-sans`, `--font-serif`).
  - `:root` and `.dark` — light/dark custom-properties holding the actual oklch values. Currently tuned to **Anthropic-paper**: warm ivory light (`oklch(0.985 0.008 75)`), sepia-tinted dark (`oklch(0.20 0.018 60)`), Charter-leaning serif stack with a CLS-safe metric fallback.
  - Prose overrides — consume the same custom-properties so blog body text inverts correctly in dark mode without falling back to uglier grays.
- **Theme toggling** — `ThemeToggle.astro` flips `.dark` on `<html>`. `@custom-variant dark` in `global.css` keys off that class instead of `prefers-color-scheme`.
- **Visual editing** — the `tina-island/[name].ts` route is the one on-demand Astro path (visual-editing endpoint). The rest of the site is statically prerendered.

## Workflow boundary

- This context reads `tina/__generated__/` for content types (the `CmsConfig` / `CmsPage` / `CmsBlog` shapes).
- This context does **not** own Tina schemas — those live in the [`cms` context](./CONTEXT-cms.md).
- Editor changes flow: content editor modifies a block in `/admin` → Tina writes back to `.mdx` → this context picks it up on the next build.
- **Memory budget at build**: `NODE_OPTIONS='--max-old-space-size=3072'` is the right cap for a 7.8 GiB VPS. 4096+ tips into OS OOM-kill; 2048 tips into JS heap OOM. Add swap (≥ 2 GiB) before raising the cap.

## Out of scope

- Tina schemas, block schema declarations, content-collection shape → [`cms` context](./CONTEXT-cms.md).
- Donation flows, member data, event management → would live in a future `CONTEXT-foundation.md`.
- Astro adapter selection (`astro.config.mjs` `getAdapter()`) — host-environment glue, not visitor-facing.

## Glossary

- **Block** — Tina page-section template. Schema at `<name>.template.ts`, component at `<name>.astro`.
- **Section** — the layout wrapper (`src/components/Section.astro`) every block uses for consistent vertical rhythm.
- **Island** — `tina-island/[name].ts` route; the on-demand Astro server route Tina's visual-editing endpoint runs through.
- **Visual primitives** — the only layout primitives in use are `Section`, `Button`, `Card`, the icon set, and so on.
- **Cosmic chrome (retired)** — `<Aurora />` / `<Starfield />` were retired in the Anthropic-paper redesign; do not reintroduce them.

## When the surface changes

If you add or rename a block, or change the token set, edit this file in the same commit. The token list and the page-section inventory are the two things that go stale fastest.
