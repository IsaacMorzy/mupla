#!/usr/bin/env bash
# bin/prep-push.sh — single-paste maintainer command for the daily-triage loop.
#
# This script DOES NOT AUTO-RUN. It is the maintainer's paste surface for
# two HUMAN-ONLY operations gated by docs/safety.md:
#
#   1. `git push origin HEAD:main` — TinaCloud rebuilds the schema on push;
#      a broken schema takes live offline.
#   2. `vercel deploy --prod` — Vercel prod is wired to the TinaCloud push
#      hook; that hook IS the gate.
#
# The agent (this script's caller in unattended cron) MUST NOT execute
# these ops. The maintainer pastes this script once per week (after the
# `daily-triage` cron posts a summary with `loop-audit --suggest` deltas),
# eyeballs the diff on the loop branch, and runs the script.
#
# Pre-flight: refuse to run if not attached to a TTY. (Loop bots call this
# from CI; they get a clear failure rather than a silent destructive push.)

set -eu
set -o pipefail

# Hard gate: refuse silent destructive ops (both stdin and stdout must be a TTY).
if [[ ! -t 0 ]] || [[ ! -t 1 ]]; then
	echo "bin/prep-push.sh: refusing to run without a TTY." >&2
	echo "  This script gates git push origin * and vercel deploy --prod, both of which" >&2
	echo "  are HUMAN-ONLY per docs/safety.md. Paste it from a creds-loaded terminal." >&2
	exit 64
fi

# Sanity: working dir must be mupla-front/ (refuse bad cwd).
if [[ ! -f astro.config.mjs ]]; then
	echo "bin/prep-push.sh: must run from mupla-front/" >&2
	exit 65
fi

# Sanity: refuse if there is no loop/daily-triage to push.
if ! git rev-parse --verify --quiet refs/remotes/origin/loop/daily-triage >/dev/null; then
	echo "bin/prep-push.sh: no loop/daily-triage branch on origin — nothing to prep." >&2
	echo "  If the daily-triage cron hasn't kicked in yet, wait a day." >&2
	exit 66
fi

# Sanity: confirm working tree is clean outside the loop branch.
if [[ -n "$(git status --porcelain)" ]]; then
	echo "bin/prep-push.sh: working tree dirty. Stash or commit before prepping push." >&2
	exit 67
fi

echo
echo "bin/prep-push.sh — daily-triage fast-forward + optional Vercel deploy"
echo
echo "  Diff ahead of main (commit-by-commit):"
git log --oneline main..origin/loop/daily-triage 2>/dev/null | head -50 || true
echo

# 1. Ask the maintainer to confirm. (read from /dev/tty; the loop bot has no tty.)
read -r -p "Push origin/loop/daily-triage -> main? [y/N] " CONFIRM_PUSH
[[ "${CONFIRM_PUSH}" =~ ^[Yy]$ ]] || { echo "aborted." >&2; exit 0; }

# 2. Fast-forward main to the loop tip. --ff-only guarantees no merge commit
#    surprises; if the histories diverge, the maintainer has to reconcile.
git fetch --prune origin
git checkout main
git merge --ff-only origin/loop/daily-triage
git push origin main

echo
echo "  main fast-forwarded to $(git rev-parse --short HEAD) — TinaCloud rebuild starting."
echo

# 3. Optional Vercel deploy trigger. Vercel reads the TinaCloud push hook
#    automatically for the prod adapter; the explicit `vercel deploy --prod`
#    is only used when holding back for staging review. Default to no-op.
read -r -p "Trigger an explicit 'vercel deploy --prod'? [y/N] " CONFIRM_VERCEL
if [[ "${CONFIRM_VERCEL}" =~ ^[Yy]$ ]]; then
	if ! command -v vercel >/dev/null 2>&1; then
		echo "bin/prep-push.sh: vercel CLI not in PATH. Install: 'pnpm dlx vercel login' first." >&2
		exit 68
	fi
	vercel deploy --prod
else
	echo "  Skipping explicit deploy. Vercel will deploy from the TinaCloud push hook."
fi

echo
echo "bin/prep-push.sh: done."
