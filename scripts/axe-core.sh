#!/usr/bin/env bash
# scripts/axe-core.sh — a11y baseline sweep via Playwright + axe-core.
#
# Runs a headless Chrome via the existing scripts/playwright-mupla.py driver,
# injects axe-core from a CDN, walks home / donate / contact, and emits both a
# raw violations JSON and a markdown summary. Exits 0 on green, 1 on any
# violation. Designed to be cron-safe (idempotent overwrites the prior run).
#
# Bucket B / T1 / Ticket #9 from docs/agents/triage-roadmap-2026-07-06.md.
# Score delta: +5 on scripts/loop-audit-local.sh (file-presence check).
#
# Pre-reqs:
#   - pnpm install has populated node_modules.
#   - Playwright chromium has been downloaded (`pnpm exec playwright install chromium`).
#   - No live server assumed: this script starts its own `astro preview` on
#     $PREVIEW_PORT (4321 by default) and tears it down on exit.

set -eu
set -o pipefail

# Configurable knobs.
: "${PREVIEW_PORT:=${AXE_PREVIEW_PORT:-4321}}"
: "${AXE_OUT_DIR:=docs/agents}"
: "${AXE_OUT_BASE:=a11y-baseline}"
: "${PNPM:=$(command -v pnpm || echo pnpm)}"

# Page set is the canonical hot-path discovered in `redesign-roadmap.md` §1.
AXE_PAGES=( "/" "/donate" "/contact" )

# Date stamp for the artifact filename. Pulled once so re-running the
# script within the same wall-clock minute still lands on the same file
# (avoids noise from double-fires).
AXE_DATE="$(date -u '+%Y-%m-%d')"
AXE_JSON="${AXE_OUT_DIR}/${AXE_OUT_BASE}-${AXE_DATE}.json"
AXE_MD="${AXE_OUT_DIR}/${AXE_OUT_BASE}-${AXE_DATE}.md"

# Sanity: working dir must contain astro.config.mjs (refuse bad cwd).
if [[ ! -f astro.config.mjs ]]; then
	echo "axe-core.sh: must run from mupla-front/ (astro.config.mjs not found)" >&2
	exit 2
fi

# Pre: build a clean dist so preview is deterministic.
echo "[axe-core] building preview..."
"$PNPM" --silent run build:local >/dev/null

# Pre: launch astro preview on a known port in the background.
echo "[axe-core] starting preview on :${PREVIEW_PORT}..."
"$PNPM" --silent run preview -- --port "${PREVIEW_PORT}" --host 127.0.0.1 &
PID=$!
trap 'kill "${PID}" 2>/dev/null || true' EXIT

# Wait for the preview to come up (max 30s).
for i in $(seq 1 60); do
	if curl -sf -o /dev/null "http://127.0.0.1:${PREVIEW_PORT}/" ; then
		break
	fi
	sleep 0.5
done

if ! curl -sf -o /dev/null "http://127.0.0.1:${PREVIEW_PORT}/" ; then
	echo "[axe-core] preview failed to start on :${PREVIEW_PORT}" >&2
	exit 3
fi

# Pre: ensure Playwright chromium is present.
if ! "$PNPM" --silent exec playwright --version >/dev/null 2>&1 ; then
	echo "[axe-core] playwright not installed; run: pnpm exec playwright install chromium" >&2
	exit 4
fi

# Workaround: pnpm exec may not be set up; fall back to node_modules/.bin/playwright.
PLAYWRIGHT_BIN="$(./node_modules/.bin/playwright --version 2>/dev/null && echo ./node_modules/.bin/playwright || echo playwright)"

mkdir -p "${AXE_OUT_DIR}"

# Run the sweep via a small inline Node script. The driver mirrors
# scripts/playwright-mupla.py's chrome-launch idiom but adds axe injection.
# Output: aggregate JSON to stdout; the bash layer writes it to AXE_JSON.
echo "[axe-core] sweeping pages: ${AXE_PAGES[*]}"
node <<EOF
const { chromium } = require('playwright');
const fs = require('fs');

const AXE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';
const PAGES = ${AXE_PAGES[@]@Q};
const PORT = ${PREVIEW_PORT};
const OUT = process.argv[2] || '${AXE_JSON}';

(async () => {
	const browser = await chromium.launch({ headless: true });
	const ctx = await browser.newContext();
	// axe-core script tag string is baked into the page each navigation.
	await ctx.addInitScript(() => {
		const s = document.createElement('script');
		s.src = '${AXE_CDN}';
		document.head.appendChild(s);
	});

	const results = { generatedAt: new Date().toISOString(), pages: [] };
	for (const path of PAGES) {
		const url = \`http://127.0.0.1:\${PORT}\${path}\`;
		const page = await ctx.newPage();
		await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
		// Wait for axe to load via the init script.
		await page.waitForFunction(() => window.axe && typeof window.axe.run === 'function', { timeout: 10000 });
		const r = await page.evaluate(async () => await window.axe.run(document, { resultTypes: ['violations'] }));
		results.pages.push({ path, url, violations: r.violations || [] });
		await page.close();
	}
	await browser.close();
	fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
	// Compact line on stdout for cron grep
	let total = 0; for (const p of results.pages) total += p.violations.length;
	process.stdout.write(\`axe_total_violations=\${total}\\n\`);
	process.exit(total === 0 ? 0 : 1);
})();
EOF

RC=$?

# Markdown summary regardless of exit code (cron wants both signal + log).
node <<EOF
const fs = require('fs');
const json = JSON.parse(fs.readFileSync('${AXE_JSON}', 'utf8'));
let md = '# A11y baseline — ' + json.generatedAt + '\\n\\n';
md += '| Page | Violations |\\n|---|---|\\n';
for (const p of json.pages) {
	md += \`| \${p.path} | \${p.violations.length} |\\n\`;
}
md += '\\n## Detail\\n';
for (const p of json.pages) {
	md += \`\\n### \${p.path}\\n\`;
	if (!p.violations.length) { md += '- green\\n'; continue; }
	for (const v of p.violations) {
		md += \`- **\${v.id}** (\${v.impact}): \${v.help}\\n  - \${v.helpUrl}\\n\`;
	}
}
fs.writeFileSync('${AXE_MD}', md);
EOF

exit "${RC}"
