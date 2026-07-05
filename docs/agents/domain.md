# Domain docs

## Layout

Multi-context. [`CONTEXT-MAP.md`](../../CONTEXT-MAP.md) at the repo root names the contexts in this repo. Each context has its own `CONTEXT-*.md` next to it.

## Per-context files

- [`CONTEXT-site.md`](../../CONTEXT-site.md) — the Astro public surface: `src/pages/`, `src/components/blocks/`, `src/content/page/`, content collections, MDX pages, layout, design tokens (`src/styles/global.css`). Skills read this when working on anything a visitor sees.
- [`CONTEXT-cms.md`](../../CONTEXT-cms.md) — the Tina editing layer: `tina/config.ts`, `tina/collections/`, `src/components/blocks/*.template.ts`, `src/content/config/`, and the generated `tina/__generated__/`. Skills read this when changing the CMS schema, block templates, or content model.

## Reader rules

- If the change touches only one context, read that one `CONTEXT-*.md` before proposing anything.
- If the change spans contexts (e.g., adding a new content collection adds a Tina schema *and* changes the rendered block), read both — note in your work which context each decision belongs to.
- If a brand-new context appears (a future `CONTEXT-foundation.md` for org-mission logic like donations, members, events), add it to `CONTEXT-MAP.md` and create the file in the same commit so docs and code stay in sync.

## Editing rules

- Don't duplicate content across `CONTEXT-*.md` files. If something applies in both contexts (e.g., a shared domain term), put it in `CONTEXT-MAP.md` instead.
- Each `CONTEXT-*.md` should answer two questions for its area: "what's the vocabulary here?" and "what stays out of scope?"
- When the rendered surface or the schema evolves, edit the matching `CONTEXT-*.md` in the same commit as the code change.
