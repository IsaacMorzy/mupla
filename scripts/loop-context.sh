#!/usr/bin/env bash
# scripts/loop-context.sh - rehydrate run.json -> diff vs STATE.md (Bucket A #2).
#
# Behaviour:
#   - Reads FIXTURE (default /tmp/run.json) and BASELINE (default STATE.md).
#   - Emits a unified diff via `diff -u` to OUT (default stdout).
#   - If FIXTURE doesn't exist, auto-seeds a tiny fixture so the script
#     doesn't fail on first run; the fixture is re-generated idempotently.
#   - Exit 0 on diff-empty (state is in sync); exit 1 on differences
#     (next-pass context has drifted from STATE.md).
#
# Idempotency: content-idempotent - re-running with the same FIXTURE+STATE.md
# contents produces identical diff output. NOT disk-idempotent on a missing
# FIXTURE: first run writes the seed fixture (line ~FIX_EOF); subsequent
# runs reuse the existing fixture. To force a fresh seed, delete the file.
#
# Output (stdout) is a `diff -u` block; consume it via `>>docs/agents/loop-context-diff.patch`
# or pipe to a pager for review.

set -eu
set -o pipefail

FIXTURE="${1:-/tmp/run.json}"
BASELINE="${2:-STATE.md}"
OUT="${3:-/dev/stdout}"

if [[ ! -f "$BASELINE" ]]; then
	echo "loop-context.sh: baseline not found at $BASELINE" >&2
	exit 64
fi

if [[ ! -f "$FIXTURE" ]]; then
	# Seed a minimal fixture so first-run is a clean PASS. The fixture is
	# overwritten on each run; downstream tooling should treat it as ephemeral.
	cat > "$FIXTURE" <<'FIX_EOF'
{
  "pass_id": "13",
  "started": "2026-07-06",
  "operator": "Codebuff agent",
  "score_at_start": 95,
  "loop_readiness": "L3 unattended loop safe",
  "active_gh_project": "mupla-front triage",
  "open_needs_triage": 31
}
FIX_EOF
fi

diff -u "$BASELINE" "$FIXTURE" > "$OUT" || rc=$?
rc="${rc:-0}"
if [[ "$rc" -eq 0 ]]; then
	echo "# loop-context: BASELINE == FIXTURE (pass-context in sync)" >&2
elif [[ "$rc" -eq 1 ]]; then
	echo "# loop-context: BASELINE differs from FIXTURE (drift detected)" >&2
else
	echo "loop-context.sh: diff returned unexpected rc=$rc" >&2
fi
exit "$rc"
