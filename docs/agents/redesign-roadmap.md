# Redesign Roadmap — mupla-front

Captures the work shipped in commit **`4b14a7f`** ("redesign: modern blog + events +
5+ sections per page per DESIGN.md"), the triage state of every open issue, and
the pending follow-ups human-gated behind `git push origin main`.

## 1. What shipped

Made the foundation site modern, editorial, and Anthropic-paper-correct
(`--paper-50` warm ivory → `--night-900` sepia night, `--amber-500` → `--amber-700`
primary, OKLCH tokens, surface-tinting for hierarchy, no shadows on cards, no
gradients on backgrounds, no pure black/white).

### Page section audit (all pages ≥ 6 sections)

| Page             | Sections | Was  | Shipped via                                                  |
|------------------|---------:|-----:|--------------------------------------------------------------|
| `home.mdx`       | 7        | 7    | untouched (already modern)                                    |
| `about.mdx`      | 6        | 6    | untouched                                                      |
| `programs.mdx`   | 6        | 6    | untouched                                                      |
| `donate.mdx`     | 8        | 8    | untouched                                                      |
| `contact.mdx`    | 7        | 5    | bumped: FAQ block + email CTA                                |
| `faq.mdx`        | 7        | 5    | bumped: religious-questions note + accessibility CTA        |
| `team.mdx`       | 7        | 5    | bumped: governance section + contact-channel features       |
| `get-involved.mdx` | 7     | 4    | bumped: orientation explainer + role-types features + callout |
| `terms.mdx`      | 8        | 3    | bumped: 5 new content/features/cta sections                  |
| `privacy.mdx`    | 8        | 3    | bumped: 5 new content/features/cta sections                  |

### Modern editorial layouts

- **Blog index** (`src/pages/blog/index.astro`): featured post hero card,
  client-side category chip filter (deep-linkable via `#category=…`, defaulting
  to `Community` for legacy posts), 3-column responsive grid, inline monthly
  newsletter form built from the same `data-newsletter` pattern as the footer.
- **Blog post detail** (`src/pages/blog/[...slug].astro` +
  `src/components/islands/BlogBody.astro`): reading-time chip computed inline
  from the rich-text body (survives TinaCMS island-refetch without losing the
  prop), category + author byline meta block, related-posts grid at the
  bottom (3 most-relevant by category-match then recency), and a thin
  scroll-tracked reading-progress bar.
- **Events index** (`src/pages/events/index.astro`): next-up featured card,
  primary-token fallback for events without an image, month-grouped upcoming
  grid, condensed past-list with no JS, hover-color-only interactions.

### Silent bug fix

- `src/components/blocks/Blocks.astro` previously routed only **9 of the 12**
  block types listed in `tina/collections/page.ts` — Faq / Team / ContactForm
  blocks silently didn't render when added via `/admin`. Now routes all 12,
  with the correct generated typename casing (`PageBlocksContact_form`).

### Schema extension

- `tina/collections/blog.ts`: added optional `category` and `author` fields.
  Backwards-compatible — every existing blog post parses unchanged. The
  regenerated `tina/__generated__/types.ts` exposes them as
  `string | null`, so the live typecheck no longer requires `any` casts.

### Token sweep (DESIGN.md §6 / §7)

| Class                                              | Where                                                | Fixed                               |
|----------------------------------------------------|------------------------------------------------------|-------------------------------------|
| `bg-amber-200 text-amber-950 dark:bg-amber-*`      | `src/pages/blog/search.astro:108` (mark highlight)   | `bg-primary/15 text-primary`        |
| `shadow-md` / `hover:shadow-lg`                    | `src/components/blocks/Callout.astro` (both branches)| removed; surface tinting only       |
| `shadow-lg` on image frame                         | `src/components/blocks/Split.astro:39`              | removed                              |
| `bg-black/70 text-white` (pure black)              | `src/components/ui/YouTubeFacade.astro:45`          | `bg-foreground/85 text-background` |
| `bg-gradient-to-r from-foreground to-foreground` (gradient property even with identical stops, §7 borderline) | `blog/index.astro` ×2, `blog/[...slug].astro` ×2, `events/index.astro` ×2 | replaced with `group-hover:text-primary` |

### Type narrowing cleanup — issue #8 closed

- 7 instances of `(data as any).category` / `(data as any).author` /
  `(data as any).body` in `src/components/islands/BlogBody.astro` and
  `src/pages/blog/[...slug].astro` replaced with typed accesses (`data?.X`
  plus a local `categoryOf(p)` helper on `CmsBlog`).
- The surface passes `pnpm tinacms build --local` standalone (Tina regen
  succeeded when the chained `astro build` OOM'd at 3072 MiB on the local
  VPS — see `CONTEXT-site.md` "Memory budget at build").

## 2. Validation at HEAD = `4b14a7f`

- `astro check` → **0 errors / 0 warnings / 0 hints** across 83 files.
- Working tree clean.
- 1 commit ahead of `origin/main` (not yet pushed — see followups).

## 3. Triage state — every open issue

| Issue | Title                                                       | State now      | Note |
|-------|-------------------------------------------------------------|---------------|------|
| #1    | Apply amber/gold primary shift                              | `wontfix`     | shipped — `--amber-500/700` already in `global.css` |
| #2    | Add primitive token layer to design system                  | `wontfix`     | shipped — primitive / semantic / `@theme inline` already in place |
| #3    | TinaCMS schema mismatch blocks production deploys            | `ready-for-human` | the human gate is `git push origin main` after #7 lands; expansion to add `category`/`author` and Faq/Team/ContactForm block types widens the drift |
| #6    | Add blog search + RSS                                       | `wontfix`     | shipped — `/blog/search` + `/rss.xml` + `pnpm build:search` |
| #7    | Modernize blog + token-violation sweep                      | `ready-for-human` | land-bound; push pending |
| #8    | Close out `(data as any)` casts on related-posts comparator | `ready-for-agent` | the comparator is fixed in `4b14a7f`; closes fully once a shared `categoryOf` helper in `src/lib/data.ts` is added |

Move #1, #2, #6 from `wontfix` → closed by `gh issue close <id>` once you're
ready to clean the queue (it's reversible via `gh issue reopen`).

## 4. Pending human-gated steps

1. `git push origin main` — 1 commit to publish.
   After push, TinaCloud rebuilds the GraphQL schema against the live
   collection shape; automatically retires issue #3.
2. (Recommended) close #1, #2, #6 — they're already shipped.
3. (Optional) consolidate the `categoryOf(p)` helper used in
   `src/pages/blog/[...slug].astro` into `src/lib/data.ts` to close #8 fully
   and give any future comparator a single source of truth.

## 5. Reference

- `CONTEXT-cms.md` and `CONTEXT-site.md` — domain docs read by future agents
- `AGENTS.md` — codebuff/oupi/Claude conventions
- `DESIGN.md` §2 (palette), §4 (component styling), §6 (depth), §7
  (do/don't) — the canonical rules this redesign was held against
- `docs/agents/triage-labels.md` — five canonical triage roles
