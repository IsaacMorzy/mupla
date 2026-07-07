#!/usr/bin/env bash
# loop-audit-local.sh — in-repo proxy for `loop-audit` (npm CLI not in $PATH here).
#
# Scores loop readiness 0–100 from filesystem presence + cross-linking. Cap at 100.
# Run from the repo root: `bash scripts/loop-audit-local.sh`.
# Outputs a per-finding note per point earned, a final score, and a level (L0 / L1 / L2 / L3).
#
# Levels (per loop-engineering README):
#   L0 ≤ 25   scaffolding absent
#   L1  > 25  report-only daily loop active
#   L2  ≥ 60  assisted fixes land
#   L3  ≥ 85  unattended loop safe

set +e
ROOT="${1:-.}"

score=0
notes=()

n() { notes+=("$1"); }

# === File presence ===
if [ -f "$ROOT/STATE.md" ];              then score=$((score + 10)); n "STATE.md present (+10)"; fi
if [ -f "$ROOT/LOOP.md" ];               then score=$((score + 10)); n "LOOP.md present (+10)"; fi
if [ -f "$ROOT/loop-run-log.md" ];       then score=$((score + 10)); n "loop-run-log.md present (+10)"; fi
if [ -f "$ROOT/docs/safety.md" ];        then score=$((score + 10)); n "docs/safety.md present (+10)"; fi
if [ -f "$ROOT/loop-budget.md" ];        then score=$((score +  5)); n "loop-budget.md present (+5)"; fi
if [ -f "$ROOT/loop-constraints.md" ];   then score=$((score +  5)); n "loop-constraints.md present (+5)"; fi
if [ -f "$ROOT/patterns/registry.yaml" ]; then score=$((score +  5)); n "patterns/registry.yaml present (+5)"; fi

# === Cross-linking (more restrictive than mere presence) ===
if grep -q 'STATE\.md'          "$ROOT/LOOP.md"               2>/dev/null; then score=$((score + 5)); n "LOOP.md references STATE.md (+5)"; fi
if grep -q 'LOOP\.md'           "$ROOT/STATE.md"              2>/dev/null; then score=$((score + 5)); n "STATE.md references LOOP.md (+5)"; fi
if grep -q 'docs/safety\.md'    "$ROOT/loop-constraints.md"   2>/dev/null; then score=$((score + 5)); n "loop-constraints.md references safety.md (+5)"; fi
if grep -q 'loop-constraints\.md' "$ROOT/docs/safety.md"      2>/dev/null; then score=$((score + 5)); n "docs/safety.md references loop-constraints.md (+5)"; fi

# === .github dogfooding ===
if [ -d "$ROOT/.github/ISSUE_TEMPLATE" ] \
   || ls "$ROOT/.github/"ISSUE_TEMPLATE* >/dev/null 2>&1; then
  score=$((score + 5))
  n ".github/ISSUE_TEMPLATE present (+5)"
fi
if [ -f "$ROOT/.github/PULL_REQUEST_TEMPLATE/pull_request_template.md" ]; then
  score=$((score + 5))
  n ".github/PULL_REQUEST_TEMPLATE present (+5)"
fi
if [ -d "$ROOT/.github/workflows" ]; then
  score=$((score + 10))
  n ".github/workflows present (+10)"
else
  n ".github/workflows MISSING — manual cron only (-0)"
fi

# === Cap at 100, choose level ===
[ "$score" -gt 100 ] && score=100

if   [ "$score" -le 25 ]; then level="L0"; desc="scaffolding absent";
elif [ "$score" -le 59 ]; then level="L1"; desc="report-only daily loop active";
elif [ "$score" -le 84 ]; then level="L2"; desc="assisted fixes land";
else                          level="L3"; desc="unattended loop safe";
fi

echo
echo "Loop Readiness Score: ${score} / 100  -- ${level} (${desc})"
echo
echo "Per-finding notes:"
for note in "${notes[@]}"; do echo "  $note"; done
echo
echo "Recommended next (for this level):"
case "$level" in
  L0) echo "  - Run loop-init to install scaffolding files: LOOP.md, STATE.md, loop-budget.md, loop-constraints.md, docs/safety.md, loop-run-log.md, patterns/registry.yaml" ;;
  L1) echo "  - Wire .github/ISSUE_TEMPLATE + .github/PULL_REQUEST_TEMPLATE (already present in this repo — promote to L2 by adding the workflow file)" ;;
  L2) echo "  - Add .github/workflows/daily-triage.yml for unattended scheduling" ;;
  L3) echo "  - Wire loop-context --check --ledger for long-running state and circuit breaker" ;;
esac
echo
exit 0
