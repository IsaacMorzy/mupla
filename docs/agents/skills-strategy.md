# Skills strategy — mupla-front

Decision recorded after researching four candidate skill ecosystems on
2026-07-06. This doc is the rationale; the loop's Pass 2 landed it. Any
future agent that questions `pi`/`freebuff`/Codebuff's skill discovery
should read this first.

## Recommendation

**Adopt Anthropic's "Agent Skills" open spec at
[`agentskills.io`](https://agentskills.io/specification) as the canonical
skill format for this repo.**

Two install locations, both storing `SKILL.md` + YAML frontmatter
folders:

- **User-global**: `~/.codebuff/skills/`
- **Project-local**: `mupla-front/docs/agents/skills/`

Curated installer of choice: **`sickn33/antigravity-awesome-skills`**
(via `npx antigravity-awesome-skills`).

## Format recap

A skill is a self-contained directory.

```text
my-skill/
├── SKILL.md       # (Required) YAML frontmatter + Markdown instructions
├── scripts/       # (Optional) Python or Bash for execution
├── references/    # (Optional) text, documentation, templates
└── assets/        # (Optional) images, logos
```

Required `SKILL.md` frontmatter fields:

| Field         | Constraint                                                   |
| ------------- | ------------------------------------------------------------ |
| `name`        | lower-case, alphanumeric + hyphens, no leading/trailing `-`; **must match parent directory name** |
| `description` | when to use the skill — agents use this to decide to load |

Optional: `license`, `compatibility`, `metadata`, `allowed-tools`.

## Why this and not the others

| Candidate                                            | Verdict                                                                                                                                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Anthropic Claude Skills spec** (agentskills.io)    | **Chosen.** Open spec, free, no vendor lock. Same Markdown + YAML frontmatter we already use. Works in `pi`, `freebuff`, Antigravity, Claude Code.                                        |
| **Google Antigravity** (`.agents/skills/`)            | **Accepted as alternate install location.** Format is *literally identical* to agentskills.io; the spec is just at a different filesystem path. Adopt as a fallback location, not primary. |
| `sickn33/antigravity-awesome-skills` repo + CLI      | **Accepted as installer.** Provides `npx antigravity-awesome-skills` — a one-shot installer that respects dependencies and bundled plugins. Quality verified per-package.              |
| `VoltAgent/awesome-agent-skills` (curated list repo) | **Accepted as discovery source.** Manually curated domain collections; browse for things the installer hasn't bundled.                                                              |
| **VoltAgent (`@voltagent/core`)**                   | **Rejected.** TypeScript-first framework with Zod-validated tool schemas. Doesn't extend our Markdown-skill universe; heavy migration cost for marginal gain given Astro + TinaCMS + MDX content pipeline. |

The fundamental reason: the mupla-front workflow is already
**document-driven** (Matt Pocock format + Astro MDX + TinaCMS
Markdown content), so a Markdown-directory-based skill ecosystem is the
**least-friction, most-skill-density** choice.

## Three writing-content skills recommended

For the mupla blog + MDX pipeline (events, programs, FAQ, donate,
team, terms, privacy, contact), three skills compose a vertical
pipeline that maps cleanly onto the project's content lifecycle:

| #  | Skill              | Mode      | Use in this repo                                                                              |
| -- | ------------------ | --------- | --------------------------------------------------------------------------------------------- |
| 1  | `writing-fragments` | explore   | Mine raw material from events / transcripts / notes; no structure yet. Used at start of a post-cycle. |
| 2  | `writing-shape`    | exploit    | Shape raw material into an article, paragraph by paragraph. Used to draft each post in the project's editorial voice. |
| 3  | `writing-beats`    | exploit    | Assemble shaped articles into a multi-post journey / arc. Used to plan a fundraising campaign or a Ramadan series. |

**Supplementary** (load on demand when tone confidence wavers):

| #  | Skill   | Use in this repo                                                                                                       |
| -- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| 4  | `brand` | Voice / vocabulary / Ihsan framing check; matches the existing brand audit in `docs/agents/session-audit-2026-07-06.md` §2. |

Together these form a complete draft-to-publication pipeline:

```
events / notes  ──►  writing-fragments  ──►  writing-shape  ──►  writing-beats  ──►  publish loop
                                                              └──►  brand (any time)
```

## Install (completed 2026-07-06, globally for `pi`, `codebuff`, Hermes-via-`codebuff`; `prompt-engineering` added Pass 5)

Each SKILL.md follows the agentskills.io spec. Name in frontmatter matches the
parent directory; description carries the when-to-use hint.

### Writing / brand content skills (Pass 3)

Eight SKILL.md files = four skills × two mirrors:

- `~/.codebuff/skills/writing-fragments/SKILL.md`
- `~/.codebuff/skills/writing-shape/SKILL.md`
- `~/.codebuff/skills/writing-beats/SKILL.md`
- `~/.codebuff/skills/brand/SKILL.md`
- `~/.pi/skills/writing-fragments/SKILL.md`
- `~/.pi/skills/writing-shape/SKILL.md`
- `~/.pi/skills/writing-beats/SKILL.md`
- `~/.pi/skills/brand/SKILL.md`

Verifier for the writing/brand set: each `~/.codebuff/skills/<name>` and
`~/.pi/skills/<name>` is a symlink to `~/.agents/skills/<name>/` —
`find ~/.codebuff/skills ~/.pi/skills -maxdepth 1 -type l -lname '*/.agents/skills/*' | wc -l` should report at least **8**.
The four skills each declare `compatibility: pi, codebuff,
codebuff-via-hermes, codex` in their frontmatter so discovery is uniform across
the agent matrix on this machine.

### `prompt-engineering` (Pass 5)

The followup-card four-pillar contract documented in
`docs/agents/loop-followup-strategy.md` lives in a dedicated skill so any
agent can produce and validate cards with the same shape. Pass 5 promoted
the empty `prompt-engineering` stubs at `~/.codebuff/skills/` and
`~/.pi/skills/` (created when the agent first saw the name through
`docs/agents/loop-followup-strategy.md` but never given bodies) to
real, mirrored skills. Three locations:

- **Canonical source**: `~/.agents/skills/prompt-engineering/SKILL.md`
  — agentskills.io-spec YAML frontmatter
  (`name: prompt-engineering`, `description` carries the when-to-use,
  `compatibility: pi, codebuff, codebuff-via-hermes, codex`, plus
  `metadata.owner/version/schema`). Body sections: When to Load, Inputs,
  Four-Pillar Verifier, **Card-Prompter** (the prompt template that drives
  the model to mint cards end-of-turn), Failure modes, Examples,
  Bundled scripts, Outputs, See also.
- **Bundled helper**: `~/.agents/skills/prompt-engineering/scripts/verify-card.sh`
  — bash executable implementing the four-pillar verifier end-to-end.
  Exit 0 = card passes; exit 1 = card fails with the failing pillar on
  stderr. The model-visible bash recipe in the strategy doc is a
  mirror of this file; they MUST stay in lockstep.
- **User-global mirrors** (symlinks to the canonical source):
  - `~/.codebuff/skills/prompt-engineering` → canonical source
  - `~/.pi/skills/prompt-engineering` → canonical source

Verifier: `./scripts/verify-card.sh "$CARD"` should exit 0 for any card
the assistant is about to emit. A self-test run in Pass 5 confirmed:
1 valid card exits 0; cards missing verb / path / `Pass N+1` / over 200
chars each exits 1 with the failing pillar named.

### Hermes-via-Ollama (model-only path)

Hermes as a raw model does not read filesystem skills directly. To bridge:
serve the `SKILL.md` body(s) as a `SYSTEM` prompt fragment via Ollama's
`Modelfile`. Pin only the on-brand skills during a campaign window; the
`brand` skill's "Hermes note" section has the exact recommended splice.

## Future work

- **Pass 3**: review whether the `daily-triage` flow's
  `needs-triage → ready-for-human` path naturally threads into the
  `writing-shape` skill (a "an issue writeup" use-case for the editor
  who decide what to publish next).
- **Pass N+1 candidates seeded by `prompt-engineering`**: when the
  next pass surfaces a card candidate (via `suggest_followups`),
  the loop must run `./scripts/verify-card.sh` on the
  unedited card before deciding to commit; the script is the gate,
  not the regex. Track in `loop-run-log.md` whether any session
  emits a card that fails the gate — those are pass failures.
- **Antigravity parallelism**: if a future task runs the project inside
  Antigravity's editor, mirror the same set of skills into
  `.agents/skills/` so both discovery paths see the same content.
- **Custom domain skills**: write `doc.project-overview`,
  `doc.design-tokens-deep-dive`, and `doc.oxfam-variant` skills under
  `mupla-front/docs/agents/skills/` for new contributors — short
  project briefings discovered by description at session start.

## See also

- [`loop-run-log.md`](../../loop-run-log.md) Pass 2 entry — origin commit.
- [`STATE.md`](../../STATE.md) — current Pass 2 status.
- [`CONTEXT-site.md`](../../CONTEXT-site.md) — domain doc for the
  Astro-side content surface that these skills target.
