#!/usr/bin/env bash
# bin/gh-create-issues.sh - bulk creates 30 GitHub issues from the
# Pass 11 30-ticket thematic roadmap (`docs/agents/triage-roadmap-2026-07-06.md`).
#
# Bucket A / T1 / Ticket deferred-from-Pass-11. Score delta: 0 (issue creation
# is not scored by `scripts/loop-audit-local.sh`; increases quality / backlog
# hygiene only).
#
# Behaviour:
#   - Extracts Title + Body template columns from each roadmap `| # | ...` row.
#     The parser is a Python heredoc that handles BOTH plain-N, bold-N, and
#     table-format variants gracefully - the prior awk regex matched only some.
#   - Skips a row if a same-title issue is already OPEN in the repo
#     (idempotent on re-run; pinned to `in:title` to avoid fuzzy matches).
#   - Paces itself at ~0.5 s/issue (well under GH's 5,000/h primary rate).
#   - Emits `docs/agents/triage-report-2026-07-06-pass-12.md` with
#     `Created / Already-open / Commands` sections the maintainer pastes.
#
# Additive-only per `docs/safety.md`: only `gh issue create --label needs-triage`
# (allowed). NO `gh issue edit --remove-label`, NO `gh issue close`. A
# maintainer pastes those as needed.

set -eu
set +H  # Disable bash history expansion so `!` in markdown bodies survives quoting.
set -o pipefail

ROADMAP="${1:-docs/agents/triage-roadmap-2026-07-06.md}"
REPO="${2:-IsaacMorzy/mupla}"
REPORT="${3:-docs/agents/triage-report-2026-07-06-pass-12.md}"

if [[ ! -f "$ROADMAP" ]]; then
	echo "gh-create-issues.sh: roadmap not found at $ROADMAP" >&2
	exit 64
fi

if ! command -v gh >/dev/null 2>&1; then
	echo "gh-create-issues.sh: gh CLI not in PATH" >&2
	exit 65
fi

# Host-level auth: gh auth status --repo <name> requires the full `repo` scope
# (private-repo write), which is the strictest case and the wrong default for a
# public repo like mupla-front. A successful host-level login is enough to
# `gh issue create` against any repo the active account can see.
if ! gh auth status --hostname github.com >/dev/null 2>&1; then
	echo "gh-create-issues.sh: not authenticated to github.com; run: gh auth login --web" >&2
	exit 66
fi
# Source-repo gate: the active account must have at least read+issue-write on
# the target repo (warn-only - gh issue create will surface the real error).
if ! gh repo view "$REPO" >/dev/null 2>&1; then
	echo "gh-create-issues.sh: cannot view $REPO (token missing repo scope or no access); run: gh auth refresh --scopes repo" >&2
	exit 66
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Roadmap has 9 cells per row: # | Pass | Title | Label | Tier | Acceptance | Effort | Score | Body template
# The awk regex was too narrow (matched only Bucket A). Replace with Python
# heredoc inside bash - the single-quoted PYEOF delimiter prevents bash from
# interpreting Python content (backticks, $, !, etc).
#
# Python parses any markdown table in the file: finds the divider row (| --- |),
# identifies the header row above it, then loops data rows that follow. Skips
# header rows. Strips bold markers (**N** -> N), then extracts Title (column 3)
# and Body template (column 9, the LAST data column).
python3 - "$ROADMAP" > "$TMP/tickets.tsv" <<'PYEOF'
import sys, re
from pathlib import Path

path = Path(sys.argv[1])
text = path.read_text()
lines = text.split('\n')

# Build a list of (line_idx, table_rows) where table_rows is a parsed table.
# Strategy: walk line by line, identify divider rows, then the header row above
# and the data rows below (until the next divider or non-table row).
tables = []
i = 0
while i < len(lines):
    line = lines[i]
    stripped = line.strip()
    # Match divider: lines whose cells are only --- / :--- / ---: / :---:
    if re.match(r'^\|(\s*:?-{2,}:?\s*\|)+\s*$', stripped):
        # Header must be the previous table-ish line.
        if i - 1 >= 0 and lines[i-1].lstrip().startswith('|'):
            header = lines[i-1]
            # Data rows follow until the next non-table line.
            rows = []
            j = i + 1
            while j < len(lines) and lines[j].lstrip().startswith('|'):
                rows.append(lines[j])
                j += 1
            # Only keep tables with at least 9 columns (otherwise it's a 2-3 col
            # nested table we don't care about).
            if header.count('|') >= 10:
                tables.append((header, rows))
            i = j
            continue
    i += 1

# Now parse each table into (title, body) pairs.
out = []
for header_row, data_rows in tables:
    cells = [c.strip() for c in header_row.strip().strip('|').split('|')]
    # Header sanity: must include 'Title' AND have at least 9 cells.
    if 'Title' not in cells or len(cells) < 9:
        continue
    title_idx = cells.index('Title')
    # Body template is conventionally the LAST cell. Try by header label first,
    # fall back to last column.
    body_idx = None
    for label in ('Body template', 'Body', 'Description'):
        if label in cells:
            body_idx = cells.index(label)
            break
    if body_idx is None:
        body_idx = len(cells) - 1
    for row in data_rows:
        rcells = [c.strip() for c in row.strip().strip('|').split('|')]
        if len(rcells) <= max(title_idx, body_idx):
            continue
        # First cell should be a number (or bold-marker number).
        first = rcells[0]
        if not re.match(r'^\*?\*?[0-9]+\*?\*?$', first):
            continue
        title = rcells[title_idx]
        body = rcells[body_idx]
        if not title or not body:
            continue
        out.append((title, body))

for title, body in out:
    # TSV-safe: replace tabs in body with 4 spaces (rare but safe).
    body_safe = body.replace('\t', '    ')
    out_line = title + '\t' + body_safe + '\n'
    sys.stdout.write(out_line)
PYEOF

ROWS="$(wc -l < "$TMP/tickets.tsv")"
echo "[gh-create-issues] found $ROWS ticket rows in $ROADMAP"

if [[ "$ROWS" -eq 0 ]]; then
	echo "gh-create-issues.sh: no rows extracted; format drift?" >&2
	exit 67
fi

if [[ "$ROWS" -gt 50 ]]; then
	echo "gh-create-issues.sh: $ROWS exceeds 50 rate-limit budget; trim roadmap first" >&2
	exit 68
fi

mkdir -p "$(dirname "$REPORT")"

cat > "$REPORT" <<'HEADER'
# Triage report - 2026-07-06 (Pass 12)
## Issue-creation run

This report captures the output of `bin/gh-create-issues.sh`: each Pass-11
roadmap ticket mapped to one GitHub issue with `--label needs-triage`. The
agent ran the burst during Pass 12 close; tickets already-open by title
match were skipped (idempotent on re-run).

HEADER

COUNT_NEW=0
COUNT_SKIP=0
while IFS=$'\t' read -r TITLE BODY; do
	# Idempotent: skip if a same-title open issue already exists. Pin search
	# to `in:title` to avoid fuzzy substring matches skipping new tickets.
	EXISTING_NUM="$(gh issue list --repo "$REPO" --state open --search "$TITLE in:title" --json number --jq '.[0].number // empty' 2>/dev/null || true)"
	if [[ -n "$EXISTING_NUM" ]]; then
		echo "  skip: $TITLE (already #${EXISTING_NUM})"
		echo "- skip: ${TITLE} (already #${EXISTING_NUM})" >> "$REPORT"
		COUNT_SKIP=$((COUNT_SKIP+1))
		continue
	fi

	echo "  create: $TITLE"
	# Write body to a tempfile and use --body-file to avoid bash quoting
	# hazards from backticks/dollars in markdown templates (Pass 9.1 hazard).
	printf '%s' "$BODY" > "$TMP/body.md"
	# gh issue create prints the new issue URL on stdout.
	NEW_URL="$(gh issue create --repo "$REPO" \
		--title "$TITLE" \
		--body-file "$TMP/body.md" \
		--label 'needs-triage' 2>/dev/null || echo "")"
	if [[ -z "$NEW_URL" ]]; then
		echo "  WARN: gh issue create returned empty for '$TITLE'" >&2
		continue
	fi
	NEW_NUM="$(echo "$NEW_URL" | grep -oE '/issues/[0-9]+' | head -1 | cut -d/ -f3)"
	echo "- #${NEW_NUM}: $TITLE - $NEW_URL" >> "$REPORT"
	COUNT_NEW=$((COUNT_NEW+1))
	# Pace ourselves: 0.5 s/issue keeps us well under GH's 5,000/h primary rate.
	sleep 0.5
done < "$TMP/tickets.tsv"

cat >> "$REPORT" <<FOOTER

## Summary

- Total tickets in roadmap: $ROWS
- Created this run:        $COUNT_NEW
- Already-open by title:    $COUNT_SKIP

## Maintainer-pasted commands

The agent committed the loop-owned Pass 12 files locally. To fast-forward
main and (optionally) trigger Vercel:

\`\`\`bash
bash bin/prep-push.sh
\`\`\`

## Triage pass for the maintainer

After applying `bin/prep-push.sh`, the maintainer pastes these `gh issue edit`
snippets to migrate the T1 tickets from `needs-triage` to `ready-for-agent`.
The agent can ALSO run these `gh issue edit --add-label` lines per
`docs/safety.md` (add-only is allowed; remove is human-only):

\`\`\`bash
# Promote Passport 11's T1 tickets (replace \$N with the actual issue numbers
# the report above prints):
gh issue edit \$N --repo IsaacMorzy/mupla --add-label ready-for-agent
\`\`\`
FOOTER

echo ""
echo "[gh-create-issues] done: $COUNT_NEW created, $COUNT_SKIP already-open, $ROWS total"
echo "[gh-create-issues] report: $REPORT"
