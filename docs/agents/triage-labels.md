# Triage labels

Five canonical labels. The role name and the label string are the same by default — `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. Skills read these strings verbatim; if you rename a label or change its color, edit this file **and** update GitHub via `gh label edit` in lockstep. The colors in the table below are byte-identical to what's currently on the remote (`IsaacMorzy/mupla`); GitHub caps descriptions at 100 chars, so the table's `Meaning` column may be longer prose than the `--description` flag.

| Role | Default label | Color | Meaning |
|---|---|---|---|
| `needs-triage`    | `needs-triage`    | `#fbca04` | Maintainer needs to evaluate |
| `needs-info`      | `needs-info`      | `#dbab09` | Waiting on reporter |
| `ready-for-agent` | `ready-for-agent` | `#0e8a16` | Fully specified; an AFK agent can pick it up with no human context |
| `ready-for-human` | `ready-for-human` | `#5319e7` | Needs a human implementer |
| `wontfix`         | `wontfix`         | `#d93f0b` | Out of scope |

## Creating or re-syncing the labels on the repo

`gh label create` errors if the label already exists; `gh label edit` is idempotent. Pick the right command per label.

### First-time setup (fresh repo)

Run once where none of the five labels exist yet:

```bash
gh label create needs-triage     --repo IsaacMorzy/mupla --color "fbca04" --description "Maintainer needs to evaluate"
gh label create needs-info       --repo IsaacMorzy/mupla --color "dbab09" --description "Waiting on reporter"
gh label create ready-for-agent  --repo IsaacMorzy/mupla --color "0e8a16" --description "Fully specified; AFK-ready"
gh label create ready-for-human  --repo IsaacMorzy/mupla --color "5319e7" --description "Needs a human implementer"
```

### Re-sync existing labels

If a label already lives on the remote (e.g. GitHub's default `wontfix #ffffff`), use `gh label edit` — it is idempotent and overwrites color/description in place:

```bash
gh label edit wontfix --repo IsaacMorzy/mupla --color "d93f0b" --description "Out of scope"
```

GitHub caps label descriptions at **100 characters** — copy the `--description` values verbatim from the table; the table is the source of truth. If any color drifts, fix it with `gh label edit` (same form as above).

## State transitions

```
               ┌──────────────┐
   arrive ───▶ │ needs-triage │ ──┬──▶ needs-info ──▶ ready-for-* ──┐
               └──────────────┘   │                                   │
                                  │                                   ▼
                                  └──▶ wontfix  ◀────────────────── close
```

The `triage` skill is the only consumer that applies these labels. It reads from `## Agent skills → Issue tracker` (in `AGENTS.md`) to discover this repo's `gh` invocation, and from this file to know the exact label strings and their colors.
