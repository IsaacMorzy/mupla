# scripts/

## `fetch-pexels.mjs`

Downloads a curated set of Pexels photographs for the mupla Foundation site
(hero, about, donate, and the 5 blog heroes), saves them to
`public/images/`, and writes a `manifest.json` next to them with attribution
metadata (photographer name + photo URL + Pexels id) for every image.

### Setup

1. Copy `.env.example` to `.env` at the repo root:

   ```bash
   cp .env.example .env
   ```

2. Paste a Pexels API key after `PEXELS_API_KEY=`. Get one for free at
   <https://www.pexels.com/api/>.

   The `.env` file is in `.gitignore` — it will not be committed.

### Run

```bash
# Node 22+ reads .env if you pass the flag
node --env-file=.env scripts/fetch-pexels.mjs

# Or, in plain shell:
set -a; . ./.env; set +a; node scripts/fetch-pexels.mjs
```

Re-running is safe: existing files are overwritten with the latest
top-ranked match for each query. The script fetches sequentially (not in
parallel) to stay comfortably under the Pexels free-tier rate limit
(200 requests/hour).

### What it produces

- `public/images/<file>.jpg` — landscape photographs for direct use in
  blocks/components
- `public/images/manifest.json` — per-image attribution metadata
- stdout summary of successes and failures

### License

Pexels images are licensed under the [Pexels License](https://www.pexels.com/license/).
Attribution is **not required**, but the manifest stores photographer name
and photo URL for our own provenance and to swap pictures when a license
flag pops up.

### Rotation

Treat the API key the way you would a database password. If you paste it
into a chat window, a bug report, or any other surface where it could be
leaked, regenerate it in your Pexels dashboard immediately.
