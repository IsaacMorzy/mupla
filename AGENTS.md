# Agent guide — mupla-front

This document is read first by `pi`, `freebuff`, `oupi`, and Claude-family agents working in this repo. The `## Agent skills` block below is the authoritative configuration used by matt-pocock-style workflows (`triage`, `to-issues`, `to-prd`, `qa`, `improve-codebase-architecture`, `diagnosing-bugs`, `tdd`).

When you (any agent) start a session in this repo, read this file first, then `CONTEXT-MAP.md` and the matching `CONTEXT-*.md` for the area you'll be touching. Update this doc only when the configuration changes (issue tracker, label vocabulary, or context layout) — not on every task.

## Agent skills

## Sub-agents

The orchestrator (parent Codebuff agent) delegates non-trivial work to specialised
sub-agents via the `spawn_agents` tool. The sub-agent roster follows a maker/checker
split: a maker sub-agent (e.g. `basher`, `file-picker`, `code-searcher`) produces a
result, and a separate `code-reviewer-minimax-m3` sub-agent inspects the change before
the orchestrator commits. This separation isolates intent from verifiability.

**Sub-agent catalogue**:

- `basher` - runs a single shell command with structured what-to-summarize prompt; lightweight executor.
- `file-picker` - fuzzy file search across the project tree, returns up to 12 paths.
- `code-searcher` - mechanical ripgrep-based search with `-A` and `-B` flag support.
- `thinker-with-files-gemini` - deep reasoning across multiple file paths via Gemini.
- `thinker-gpt` - deep reasoning using the parent conversation history (no tools).
- `researcher-web` / `researcher-docs` - targeted web + technical-DOCS lookups.
- `tmux-cli` - general-purpose agent for interacting with tmux-driven CLIs.
- `browser-use` - Chrome DevTools automation; requires Chrome installed (NOT met in
  the agent env that produced this file: see System Info, `Chrome: not found`).
- `code-reviewer-minimax-m3` - dedicated code-quality reviewer (always invoked after
  non-trivial code changes; output is brief, bulleted, by-file).

**Invocation pattern**:

```python
spawn_agents(agents=[
  {"agent_type": "basher", "params": {"command": "...", "what_to_summarize": "..."}}
  {"agent_type": "code-reviewer-minimax-m3", "params": {"prompt": "..."}}
])
```

**Constraint**: sub-agents NEVER apply ready-for-human / wontfix / close labels,
NEVER push to `origin main`, NEVER `vercel deploy --prod`. These gates are reserved
for the maintainer per `docs/safety.md`.

See `loop-constraints.md ## Sub-agent (maker/checker split)` for the maker-side
perspective; `docs/safety.md` for HUMAN-ONLY gate inventory.


### Issue tracker

GitHub Issues on [`IsaacMorzy/mupla`](https://github.com/IsaacMorzy/mupla), reached via the `gh` CLI. External (non-collaborator) pull requests are pulled into the same `/triage` queue as issues. See [`docs/agents/issue-tracker.md`](./docs/agents/issue-tracker.md).

### Triage labels

Five canonical labels — `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix` — synced to the repo via the `gh` CLI (`gh label create` for new labels, `gh label edit` for re-syncs). See [`docs/agents/triage-labels.md`](./docs/agents/triage-labels.md).

### Loop infrastructure

A `daily-triage` loop is installed on this repo. Its scaffolding lives at the repo root and in `docs/`:

- [`LOOP.md`](./LOOP.md) — cadence, pass sequence, human gates.
- [`STATE.md`](./STATE.md) — current-pass progress (overwritten per pass).
- [`loop-budget.md`](./loop-budget.md) — per-pass token / time / ops caps.
- [`loop-constraints.md`](./loop-constraints.md) — path / op denylists.
- [`docs/safety.md`](./docs/safety.md) — human-gate policy.
- [`loop-run-log.md`](./loop-run-log.md) — append-only pass history.
- [`patterns/registry.yaml`](./patterns/registry.yaml) — machine-readable pattern index.
- [`loop-design-checklist.md`](./loop-design-checklist.md) — Loop-Engineering primitive cross-walk (Pass 9).
- `scripts/loop-audit-local.sh` — in-repo proxy for `loop-audit` (npm CLI not in `$PATH` here).
- Per-pass triage reports live under `docs/agents/triage-report-YYYY-MM-DD.md`.
- Per-pass deltas are appended to `docs/agents/redesign-roadmap.md` §3.1.

Agents may read all loop files freely. Writes follow `docs/safety.md` — `git push`, `gh issue close`, and `--remove-label` ops are human-only.

### Domain docs

Multi-context. `CONTEXT-MAP.md` at the root names the contexts in this repo. Skills read the right `CONTEXT-*.md` for the area they're working in. See [`docs/agents/domain.md`](./docs/agents/domain.md).

### matt-pocock skills (globally installed)

The matt-pocock workflow family is wired into this repo through globally installed skills under `~/.agents/skills/` (canonical) and symlinked to `~/.codebuff/skills/` and `~/.pi/skills/` for both `pi` and `codebuff` agent entry points. Each skill below is loaded by name; agents should not re-derive behaviour locally.

| Skill | Canonical path | When to load in this repo |
| --- | --- | --- |
| `writing-fragments` | `~/.agents/skills/writing-fragments/SKILL.md` | At the start of any new content cycle (blog post, event recap, announce), or when re-shaping MDX drafts from raw notes. |
| `writing-shape` | `~/.agents/skills/writing-shape/SKILL.md` | When shaping one fragment dump into a single published article. Pair with `writing-fragments` upstream, `writing-beats` downstream. |
| `writing-beats` | `~/.agents/skills/writing-beats/SKILL.md` | When composing a multi-post campaign arc (Ramadan, end-of-year, fundraising). Loads events under `src/content/event/*.mdx`. |
| `brand` | `~/.agents/skills/brand/SKILL.md` | Voice / Ihsan framing check; load before publishing any article, post, or page-level copy. Canonical reference: `docs/agents/session-audit-2026-07-06.md` §2. |
| `design-taste-frontend` | `~/.agents/skills/design-taste-frontend/SKILL.md` | Anti-slop frontend review — call before shipping any UI in `src/components/**` or `src/pages/**`. Token discipline (§§2-7), motion (§5), accessibility (§8), and AI tells (§9). |
| `prompt-engineering` | `~/.agents/skills/prompt-engineering/SKILL.md` | Load at loop close to mint followup cards; the four-pillar verifier (`~/.agents/skills/prompt-engineering/scripts/verify-card.sh`) gates every `suggest_followups` emission. |

### SKILL.md quick-load

If your entry point is `pi` (no agent on the loop yet), the explicit load command is `skill writing-fragments` etc. If your entry point is `codebuff`, the agent auto-discovers them from `~/.codebuff/skills/<name>/SKILL.md`. Both honour the agentskills.io frontmatter spec (`name`, `description`, `compatibility`).
