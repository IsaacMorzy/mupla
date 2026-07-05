# Domain context map

Two contexts in this repo:

1. **site** — the Astro public surface (`src/pages/`, `src/components/blocks/`, `src/content/page/`, MDX pages, design tokens). Read [`CONTEXT-site.md`](./CONTEXT-site.md) when working on anything a visitor sees.
2. **cms** — the Tina editing layer (`tina/`, `src/components/blocks/*.template.ts`, `src/content/config/`, generated artefacts under `tina/__generated__/`). Read [`CONTEXT-cms.md`](./CONTEXT-cms.md) when changing the CMS schema, block templates, or content model.

Shared domain terms (anything that doesn't belong to either context alone) live here. If a third context appears later (a likely candidate: `foundation`, for org-mission logic like donations, members, events), append it here and create `CONTEXT-foundation.md` in the same commit.
