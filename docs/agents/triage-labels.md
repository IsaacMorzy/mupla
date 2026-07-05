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

Run once after this file lands; rerun any single line after a rename or color change:

```bash
gh label create needs-triage       --repo IsaacMorzy/mupla --color "fbca04" --description "Maintainer needs to evaluate"
gh label create needs-info         --repo IsaacMorzy/mupla --color "dbab09" --description "Waiting on reporter"
gh label create ready-for-agent    --repo IsaacMorzy/mupla --color "0e8a16" --description "Fully specified; AFK-ready"
gh label create ready-for-human    --repo IsaacMorzy/mupla --color "5319e7" --description "Needs a human implementer"
gh label create wontfix            --repo IsaacMorzy/mupla --color "d93f0b" --description "Out of scope"
```

`gh label create` is **not idempotent** — it errors if the label already exists. The two safe patterns:

- **First-time setup** — run the block above as-is.
- **Re-sync a single label** — run `gh label edit <name> --repo IsaacMorzy/mupla --color "<hex>" --description "<desc>"` instead. This is how you keep a row in the table and the remote aligned byte-for-byte when one drifts.

Color drift is the #1 way this wiring breaks silently. If a label has a different color on the remote, this file and GitHub are out of sync — fix with `gh label edit`.

## State transitions

```
               ┌──────────────┐
   arrive ───▶ │ needs-triage │ ──┬──▶ needs-info ──▶ ready-for-* ──┐
               └──────────────┘   │                                   │
                                  │                                   ▼
                                  └──▶ wontfix  ◀────────────────── close
```

The `triage` skill is the only consumer that applies these labels. It reads from `## Agent skills → Issue tracker` (in `AGENTS.md`) to discover this repo's `gh` invocation, and from this file to know the exact label strings and their colors.
