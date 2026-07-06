#!/usr/bin/env bash
# bin/gh-setup-project.sh
# -----------------------------------------------------------------------------
# Maintainer-only-paste (per docs/safety.md additive-only surface). The agent
# may run this locally after the issue-create step; the result is a board the
# maintainer can review before any further automation is unblocked.
#
# What it does (additive only — never closes, never labels ready-for-human):
#   1. Verifies `gh` is authenticated and reports the active account.
#   2. Creates a user-scoped GH Project named "mupla-front triage" if missing.
#      Seven columns mirror the canonical triage state machine in
#      docs/agents/triage-labels.md:
#         - Backlog        (uncommitted issues that need categorisation)
#         - needs-triage   (created via bin/gh-create-issues.sh)
#         - ready-for-agent  (implementation underway via loop)
#         - ready-for-human  (maintainer-only gates: push/deploy/close)
#         - needs-info       (waiting on operator clarification)
#         - wontfix          (declined, maintainer-only promotion)
#         - done             (closed / shipped / verified)
#      Field-create runs idempotently — re-runnable and tolerant of existing
#      partial projects (e.g. one left empty by a prior failed run).
#   3. Adds every open issue labelled `needs-triage` to the project (Backlog).
#
# Idempotency: project-name match (so a re-run after partial success finishes
# the missing steps; never deletes or restructures existing data).
#
# MUST NOT do (per docs/safety.md):
#   - git push origin *
#   - vercel deploy --prod *
#   - gh issue close
#   - gh issue edit --remove-label
#   - apply ready-for-human / wontfix / close-label promotions
#
# Exit semantics: 0 on success or "nothing to do"; 2 on gh CLI missing; 1 on
# gh auth failure; non-zero on any gh subcommand non-zero exit.
# -----------------------------------------------------------------------------

set -euo pipefail

PROJECT_TITLE="mupla-front triage"

red()    { printf '\033[31m%s\033[0m\n' "$*"; }
green()  { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }

# 1. Pre-flight: gh presence + auth ----------------------------------------------
if ! command -v gh >/dev/null 2>&1; then
  red "bin/gh-setup-project.sh: gh CLI not found on PATH."
  red "Install it from https://cli.github.com/ then rerun."
  exit 2
fi

if ! gh auth status >/dev/null 2>&1; then
  red "bin/gh-setup-project.sh: gh is not authenticated."
  red "Run: gh auth login   (HTTPS; repo + project scopes)   then rerun."
  exit 2
fi

# 1a. gh version floor: gh project field-create requires gh >= 2.32.
# Older builds use gh project column-create with different flag surface; we warn
# best-effort and continue (column-create failures are surfaced per-column).
GH_VERSION="$(gh --version 2>/dev/null | awk '{print $3}' | head -n1 || true)"
if [[ -n "$GH_VERSION" ]]; then
  if ! printf '%s' "$GH_VERSION" | grep -qE '^(2\.(3[2-9]|[4-9][0-9])|[3-9][0-9]*\.)'; then
    yellow "bin/gh-setup-project.sh: gh $GH_VERSION may lack `field-create`; columns will need manual UI creation if creation silently fails." >&2
  fi
fi

ACCOUNT="$(gh api user --jq .login 2>/dev/null || true)"
if [[ -z "$ACCOUNT" ]]; then
  red "bin/gh-setup-project.sh: cannot determine active GitHub account."
  exit 2
fi
yellow "bin/gh-setup-project.sh: authenticated as $ACCOUNT"

# 2. Resolve existing project (idempotency) --------------------------------------
PROJECT_NUMBER=""
EXISTING="$(gh project list --owner "@me" --format json --jq ".projects[] | select(.title == \"$PROJECT_TITLE\") | .number" 2>/dev/null || true)"

if [[ -n "$EXISTING" ]]; then
  PROJECT_NUMBER="$EXISTING"
  green "bin/gh-setup-project.sh: project '$PROJECT_TITLE' already exists (#$PROJECT_NUMBER); will seed any missing columns and add new issues."
else
  yellow "bin/gh-setup-project.sh: creating user-scoped GH Project '$PROJECT_TITLE' under @me ..."
  CREATE_OUT="$(gh project create --owner "@me" --title "$PROJECT_TITLE" --format json 2>&1)" || {
    red "bin/gh-setup-project.sh: gh project create failed:"
    red "$CREATE_OUT"
    exit 1
  }
  # `gh project create --format json` returns an object with a numeric field.
  # Older gh builds return JSON without a stable top-level key, so we coerce.
  PROJECT_NUMBER="$(printf '%s' "$CREATE_OUT" | grep -oE '"number"[[:space:]]*:[[:space:]]*[0-9]+' | grep -oE '[0-9]+' | head -n1 || true)"
  if [[ -z "$PROJECT_NUMBER" ]]; then
    # Fallback: list and find the just-created project.
    PROJECT_NUMBER="$(gh project list --owner "@me" --format json --jq ".projects[] | select(.title == \"$PROJECT_TITLE\") | .number" 2>/dev/null | head -n1 || true)"
  fi
  if [[ -z "$PROJECT_NUMBER" ]]; then
    red "bin/gh-setup-project.sh: project create succeeded but cannot read back the project number."
    red "Raw output: $CREATE_OUT"
    exit 1
  fi
  green "bin/gh-setup-project.sh: created project '$PROJECT_TITLE' (#$PROJECT_NUMBER)."
fi

# 2a. Idempotent column-seed: runs in BOTH fresh + existing paths. gh project
# field-list enumerates existing field names; only create columns that don't
# yet exist. Skipped silently if the gh version lacks `field-create`.
declare -a COLUMNS=(
  "Backlog"
  "needs-triage"
  "ready-for-agent"
  "ready-for-human"
  "needs-info"
  "wontfix"
  "done"
)
EXISTING_FIELDS_JSON="$(gh project field-list "$PROJECT_NUMBER" --owner "@me" --format json 2>/dev/null || echo '{}')"
# pipefail-safe pipeline: trailing `|| true` covers the empty-fields case where
# grep returns 1 (no matches) and the pipeline as a whole exits non-zero.
EXISTING_FIELD_NAMES="$(printf '%s' "$EXISTING_FIELDS_JSON" | grep -oE '"name"[[:space:]]*:[[:space:]]*"[^"]+"' | sed -E 's/.*"name"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/' 2>/dev/null || true)"
for col in "${COLUMNS[@]}"; do
  if printf '%s\n' "$EXISTING_FIELD_NAMES" | grep -qxF "$col" 2>/dev/null; then
    continue
  fi
  yellow "  + column: $col"
  gh project field-create "$PROJECT_NUMBER" --owner "@me" --name "$col" --type single_select --datatype string >/dev/null 2>&1 || \
    yellow "    (skip - gh version may lack field-create; add via UI if needed)"
done

# 3. Add every open `needs-triage` issue to the project ---------------------------
yellow "bin/gh-setup-project.sh: enumerating open needs-triage issues ..."
if ! OPEN_JSON="$(gh issue list --label needs-triage --state open --json number,title,node_id,url --limit 200 2>/dev/null)"; then
  yellow "bin/gh-setup-project.sh: gh issue list failed; will not add items. The board is still usable."
  exit 0
fi

OPEN_COUNT="$(printf '%s' "$OPEN_JSON" | grep -oE '"number"[[:space:]]*:[[:space:]]*[0-9]+' | wc -l | tr -d ' ')"
ADDED=0
SKIPPED=0
while IFS= read -r ISSUE_NODE_ID; do
  [[ -z "$ISSUE_NODE_ID" ]] && continue
  # `gh project item-add` is idempotent at the API level - duplicate add raises
  # an error we swallow as "already on board".
  if gh project item-add "$PROJECT_NUMBER" --owner "@me" --id "$ISSUE_NODE_ID" >/dev/null 2>&1; then
    ADDED=$((ADDED + 1))
  else
    SKIPPED=$((SKIPPED + 1))
  fi
done < <(printf '%s' "$OPEN_JSON" | grep -oE '"node_id"[[:space:]]*:[[:space:]]*"[^"]+"' | sed -E 's/.*"node_id"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')

green "bin/gh-setup-project.sh: project '#$PROJECT_NUMBER' owns $ADDED newly-added + $SKIPPED already-on-board (of $OPEN_COUNT open needs-triage) issues."
green "bin/gh-setup-project.sh: open https://github.com/users/$ACCOUNT/projects/$PROJECT_NUMBER to review."
exit 0
