# Agent guide — mupla-front

This document is read first by `freebuff`, `oupi`, and Claude-family agents working in this repo. The `## Agent skills` block below is the authoritative configuration used by matt-pocock-style workflows (`triage`, `to-issues`, `to-prd`, `qa`, `improve-codebase-architecture`, `diagnosing-bugs`, `tdd`).

When you (any agent) start a session in this repo, read this file first, then `CONTEXT-MAP.md` and the matching `CONTEXT-*.md` for the area you'll be touching. Update this doc only when the configuration changes (issue tracker, label vocabulary, or context layout) — not on every task.

## Agent skills

### Issue tracker

GitHub Issues on [`IsaacMorzy/mupla`](https://github.com/IsaacMorzy/mupla), reached via the `gh` CLI. External (non-collaborator) pull requests are pulled into the same `/triage` queue as issues. See [`docs/agents/issue-tracker.md`](./docs/agents/issue-tracker.md).

### Triage labels

Five canonical labels — `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix` — synced to the repo via the `gh` CLI (`gh label create` for new labels, `gh label edit` for re-syncs). See [`docs/agents/triage-labels.md`](./docs/agents/triage-labels.md).

### Domain docs

Multi-context. `CONTEXT-MAP.md` at the root names the contexts in this repo. Skills read the right `CONTEXT-*.md` for the area they're working in. See [`docs/agents/domain.md`](./docs/agents/domain.md).
