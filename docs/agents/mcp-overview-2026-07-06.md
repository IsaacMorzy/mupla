# MCP overview - 2026-07-06 (Pass 13.4)

> Single-page integration brief cross-referencing the three source articles
> with the concrete wiring landed in this pass and the maintainer paste
> surface to activate it.

## Source articles

- https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- https://www.anthropic.com/institute/recursive-self-improvement
- https://cobusgreyling.substack.com/p/loop-engineering

## What mupla-front already does (no change required)

| Pattern | Where it lives |
| --- | --- |
| Durable state spine | STATE.md (per-pass overwrite per LOOP.md) |
| Maker-checker split | AGENTS.md ## Sub-agents + loop-constraints.md ## Sub-agent |
| Sprint history | loop-run-log.md (append-only) |
| Drift recovery index | STATE.md ## Drift recovery index |
| Heartbeat auditing | scripts/loop-audit-local.sh |
| Intent persistence / Skills | AGENTS.md ## matt-pocock skills + ~/.agents/skills/ |
| Goal-conditioned loops | loop-constraints.md (path + op denylists) |
| Sprint contracts | Bucket tickets carry an `Acceptance` column |

## What this pass adds (Operator Connectors slot)

1. **github-mcp** - GitHub issues/PRs/labels as tool calls (additive to gh CLI).
2. **playwright-mcp** - headless browser + Chromium; replaces `axe-core.sh` bash invocation once wired.
3. **puppeteer-mcp** - alternative to playwright-mcp; pick ONE when wiring the loop harness.

## How to activate (maintainer paste, TTY-gated per docs/safety.md)

```bash
cd /home/crowd/Documents/frontend/astro/projects/mupla/mupla-front
bash bin/mcp-bootstrap.sh
```

The script installs the connectors via `npx -y` and emits a probe of install state. `status: not-active` flips to `status: active` by hand in `patterns/registry.yaml` once the manifest is verified locally.

## Article-derived prescriptions mapped to this repo

| Article | Prescription | Where it lives |
| --- | --- | --- |
| Effective-harnesses | Pre-flight check | scripts/loop-context.sh (Pass 13) + scripts/loop-audit-local.sh |
| Effective-harnesses | Atomic incremental progress + commit per subtask | git discipline + STATE.md overwrite per pass |
| Effective-harnesses | Drift detection via git history | STATE.md ## Drift recovery index |
| Recursive-self-improvement | Sprint contracts | Bucket tickets ## Acceptance column |
| Recursive-self-improvement | Decomposition into tractable chunks | loop-budget.md 200k cap + per-pass surface declaration in STATE.md ## Onward contract |
| Recursive-self-improvement | State-carrying context resets | STATE.md overwrite + loop-run-log.md append |
| Loop-engineering (Cobus Greyling) | Operator Connectors | patterns/registry.yaml ## mcp_connectors (this pass) + .mcp.json + bin/mcp-bootstrap.sh |

## Agent authority

Agent may add entries to `patterns/registry.yaml ## mcp_connectors` (additive, reversible) but never runs the install. `bin/mcp-bootstrap.sh` is the maintainer paste surface, mirroring `bin/prep-push.sh` style.

## Files touched this pass

- `.mcp.json` - newly created; currently empty `mcpServers: []`
- `bin/mcp-bootstrap.sh` - newly created; TTY-gated installer
- `patterns/registry.yaml` - extended with `mcp_connectors:` block (3 entries, all `not-active`)
- `docs/agents/mcp-overview-2026-07-06.md` - this document
- `STATE.md` - pass_id bumped 13.2 -> 13.4; Predecessor chain extended with `/ 13.4`
- `loop-run-log.md` - Pass 13.4 entry appended

## Cost & risk

Each connector install is ~25 MB on disk. None touch loop files at runtime - canonical action surface remains `gh` CLI for the cron; MCP adds a sidecar for tool-call usage by ad-hoc agents.

## See also

- `docs/safety.md` - human-only op denylist
- `loop-constraints.md` - path / op denylist
- `bin/prep-push.sh` - the canonical human-paste example this script mirrors
