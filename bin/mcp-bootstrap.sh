#!/usr/bin/env bash
# bin/mcp-bootstrap.sh - MCP connector installer for mupla-front.
# Mirrors bin/prep-push.sh style: refuse to run without TTY.
# Agent NEVER runs this; maintainer pastes it once after bin/prep-push.sh.

set -eu
set -o pipefail

if [[ ! -t 1 ]] || [[ ! -t 0 ]]; then
  echo "bin/mcp-bootstrap.sh: refusing without TTY (human-only per docs/safety.md)." >&2
  echo "  Paste from a creds-loaded terminal, not from a CI bot." >&2
  exit 64
fi

if [[ ! -f astro.config.mjs ]]; then
  echo "bin/mcp-bootstrap.sh: must run from mupla-front/ - astro.config.mjs missing." >&2
  exit 65
fi

CONNECTORS=(github-mcp playwright-mcp puppeteer-mcp)

echo
echo "bin/mcp-bootstrap.sh - MCP connector installer"
echo
echo "Connectors available: ${CONNECTORS[*]}"
echo

read -r -p "Proceed with all 3 connectors? [y/N] " CONFIRM_ALL
if [[ ! "${CONFIRM_ALL}" =~ ^[Yy]$ ]]; then
  echo "Aborted." >&2
  exit 0
fi

echo
echo "-- installing github-mcp (npm package: @modelcontextprotocol/server-github)"
npx -y @modelcontextprotocol/server-github --version || echo "(version check failed)"

echo
echo "-- installing playwright-mcp (requires chromium)"
npx -y @playwright/mcp-server --version || echo "(version check failed)"

echo
echo "-- installing puppeteer-mcp (requires chromium)"
npx -y @puppeteer/mcp-server --version || echo "(version check failed)"

echo
echo "bin/mcp-bootstrap.sh: install probe done. Verify local invocations + flip status in patterns/registry.yaml."
