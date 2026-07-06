#!/usr/bin/env bash
# bin/mcp-bootstrap.sh - MCP connector installer for mupla-front.
# Source of truth: patterns/registry.yaml ## mcp_connectors block.
# The install_cmd list is parsed via awk (no hardcoded duplicate list,
# no YAML library dependency). Mirrors bin/prep-push.sh TTY-gate style.
# Agent NEVER runs this; maintainer pastes once after bin/prep-push.sh.

set -eu
set -o pipefail

if [[ ! -t 0 ]] || [[ ! -t 1 ]]; then
  echo "bin/mcp-bootstrap.sh: refusing without TTY (human-only per docs/safety.md)." >&2
  echo "  Paste from a creds-loaded terminal, not from a CI bot." >&2
  exit 64
fi

if [[ ! -f astro.config.mjs ]] || [[ ! -f patterns/registry.yaml ]]; then
  echo "bin/mcp-bootstrap.sh: must run from mupla-front/ (astro.config.mjs or patterns/registry.yaml missing)." >&2
  exit 65
fi

# Pull (id, install_cmd) pairs from the mcp_connectors YAML block.
# awk keeps the script env-light: no pyyaml / yq dependency.
declare -a IDS=()
declare -a CMDS=()
i=0
while IFS=$'\t' read -r id cmd; do
  if [ -n "$id" ] && [ -n "$cmd" ]; then
    IDS[$i]="$id"
    CMDS[$i]="$cmd"
    i=$((i+1))
  fi
done < <(
  awk '
    /^mcp_connectors:/      { in_block = 1; next }
    in_block && /^  - id:/  {
      sub(/^[[:space:]]*-[[:space:]]*id:[[:space:]]*/, "")
      cur_id = $0
      next
    }
    in_block && /^    install_cmd:/ {
      sub(/^[[:space:]]*install_cmd:[[:space:]]*/, "")
      print cur_id "\t" $0
      next
    }
    in_block && /^[a-zA-Z]/ && !/^mcp_connectors:/ { in_block = 0 }
  ' patterns/registry.yaml
)

if [ ${#IDS[@]} -eq 0 ]; then
  echo "bin/mcp-bootstrap.sh: no mcp_connectors entries found in patterns/registry.yaml." >&2
  echo "  Add at least one entry under mcp_connectors: first." >&2
  exit 66
fi

echo
echo "bin/mcp-bootstrap.sh - MCP connector installer"
echo "Source of truth: patterns/registry.yaml ## mcp_connectors (no hardcoded duplicate list)."
echo
echo "Found ${#IDS[@]} MCP connector(s):"
for idx in "${!IDS[@]}"; do
  echo "  - ${IDS[$idx]} : ${CMDS[$idx]}"
done
echo

read -r -p "Proceed with all connectors? [y/N] " CONFIRM
if [[ ! "${CONFIRM}" =~ ^[Yy]$ ]]; then
  echo "Aborted." >&2
  exit 0
fi

echo
declare -a OK=()
declare -a WARN=()
for idx in "${!IDS[@]}"; do
  id="${IDS[$idx]}"
  cmd="${CMDS[$idx]}"
  echo "-- installing $id ($cmd)"
  if npx -y "$cmd" --version 2>/dev/null; then
    OK+=("$id")
  else
    echo "  (failed; skip)"
    WARN+=("$id")
  fi
done

echo
echo "bin/mcp-bootstrap.sh: ok=${#OK[@]}, warn=${#WARN[@]}"
if [ ${#WARN[@]} -gt 0 ]; then
  echo "  warnings: ${WARN[*]}"
fi
echo "Verify local invocations + flip status to active in patterns/registry.yaml per connector."
