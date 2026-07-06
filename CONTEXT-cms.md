# CMS context — the Tina editing layer

This is the editor-facing side of mupla. Tina Cloud (or the local Tina client) writes in here; the rendered site reads from `tina/__generated__/`.

## Domain primitives

- **Collection** — a Tina collection declared in `tina/collections/<name>.ts`. Three currently:
  - `page` — top-level pages by slug under `src/content/page/`.
  - `blog` — long-form posts under `src/content/blog/`.
  - `config` — singleton global config under `src/content/config/`.
- **Block template** — the schema/data-shape for a page section, declared in `src/components/blocks/<name>.template.ts`. Imported by `tina/collections/page.ts` and listed in the `templates:` array there.
- **Field types** — Tina primitives: `string`, `boolean`, `image`, `datetime`, `rich-text`, plus `object` with `list: true` for arrays. Object fields apply to nested structures (e.g. `image` → `{ src, alt }`).
- **Visual selector** — `ui: { visualSelector: true }` on the `Page Sections` field wires the block picker UI in `/admin`.
- **Generated artefacts** — `tina/__generated__/` rebuilds every time `tinacms dev` (or `tinacms build --local`) runs. The generated client is consumed by `src/lib/data.ts`, which exports `getConfig()`, `getPage(slug)`, `getBlog(slug)`, `listPages()`, `listBlogs()`. The derived types (`CmsConfig`, `CmsPage`, `CmsBlog`, and the per-block `HeroBlock` / `FeaturesBlock` / etc. shapes) are inferred from the loader return types — no hand-written shapes.
- **Domain data loaders** — primary loaders are in `src/lib/data.ts`. They wrap generated client queries with `requestWithMetadata()` so the editor overlay flows in when the page renders inside the admin iframe.

## Workflow boundary

- This context owns schemas, not rendering — the [`site` context](./CONTEXT-site.md) picks up the rendered output.
- Editor changes flow: Tina UI → JSON / MDX writes → git diff → site re-renders on the next build.
- The build path `tinacms build --local -c "astro build"` runs two peak phases in series: Tina's pre-build (graph + types) and Astro's bundle. Both share the `NODE_OPTIONS` script-level cap. See the [site context memory note](./CONTEXT-site.md#workflow-boundary).

## Triage integration

Issues raised against this context follow the `triage` skill's label vocabulary — see [`docs/agents/triage-labels.md`](./docs/agents/triage-labels.md). CMS changes that surface as bugs (e.g., schema validation drift after `__generated__` regenerates, or a block whose TypeScript type fails after Tina refactors) should land in issues labelled `needs-triage` and move through the same workflow as anything else.

## Out of scope

- Astute Astro rendering work — that's [`CONTEXT-site.md`](./CONTEXT-site.md).
- Future storage layer for the Foundation-org data — that's a future `CONTEXT-foundation.md`.

## Glossary

- **Schema** — Tina collection declaration; lives in `tina/collections/<name>.ts`.
- **Template** — block-level schema fragment (a Tina `Template` inside a collection). Lives in `src/components/blocks/<name>.template.ts`.
- **Field** — single named entry in a schema. The visual editor surfaces each field with the `label` you declared.
- **Generated** — code or types emitted under `tina/__generated__/` by the Tina CLI; treat as derived state, **do not edit by hand**. To regenerate after a schema change, run `tinacms build --local` (or `tinacms dev` for the equivalent without a static build).
- **TinaCloud** — the hosted Tina backend. Until `clientId` and `token` are configured via env (`PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN`), only the `--local` mode works.

## YAML quirks in content MDX

Two YAML grammar traps recur across content authors. Both abort the entire Tina seed pass at `pnpm build` time.

- **Inside `'…'`-single-quoted scalars, apostrophes must be `''`.**
  A single-quoted YAML string spans from `'` to the next `'`; an unescaped `'` terminates the string mid-content and everything after parses as YAML, which fails. Example: ``'They didn''t ask for ID'``. Double-quoted (`"…"`) and unquoted scalars have no restriction.
- **Inside `body: |` / `text: |` literal blocks, body content must stay at the block's indent unit.**
  A line at column 0 terminates the pipe-style block early, and any trailing paragraph at lower indentation silently breaks the frontmatter. Match the block's standard indent (6 spaces under `- body: |`) and put a blank line before any `## H2`-style heading inside it.

When `pnpm build` dies with `can not read a block mapping entry; a multiline key may not be an implicit key` or `bad indentation of a sequence entry`, scan the offending file for the two patterns above. All MDX under `src/content/page/`, `src/content/blog/`, and `src/content/event/` is a candidate — `pnpm build` names the file in the error.

## Schema drift and sync

TinaCMS uses "schema-as-code" — **there is no separate CLI push command** in `@tinacms/cli` v2.x. When you `git push` a schema change to the branch TinaCloud is configured to watch (typically `main`; configured in [app.tina.io](https://app.tina.io) under the project's Build settings), TinaCloud rebuilds its GraphQL schema from the current `tina/config.ts` + `src/components/blocks/*.template.ts`.

The `tina/config.ts` `branch` setting (`GITHUB_BRANCH` → `VERCEL_GIT_COMMIT_REF` → `HEAD` → `main`) is a **different control**: it tells Tina's GraphQL query which branch's CONTENT to fetch at build time — **not** which branch TinaCloud watches for schema rebuilds.

When `tinacms build --content=local` fails with `[BREAKING - FIELD_REMOVED]` or `FIELD_ADDED`, local and TinaCloud schemas have drifted. Recovery:

1. Confirm the schema change is committed in this repo (`git status` clean, `git log -p` shows the field add/remove).
2. `git push origin <branch>` to the branch TinaCloud is configured to watch (typically `main` — confirm in app.tina.io under Build settings). The `tina/config.ts` `branch` setting is unrelated; see the previous paragraph.
3. Wait for TinaCloud to rebuild the project — visible in [app.tina.io](https://app.tina.io) under the project's Build logs.
4. Re-run the build locally to confirm the cloud/local disagreement is gone.

If builds must succeed while TinaCloud is catching up, run `pnpm build:local` (uses `--skip-cloud-checks`, suitable for local iteration only) or temporarily extend `vercel.json`'s `buildCommand` with `--skip-cloud-checks`. **Remove the workaround as soon as TinaCloud is back in sync** — leaving the bypass in production silently hides future schema drift.

## When the schema changes

If you add a collection, a block template, or rename a field, edit this file in the same commit. The collection map and the field-types-in-use are what go stale fastest.
