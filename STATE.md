# STATE.md — current pass progress

**Read at the start of every pass; overwrite at the end.**
This file is the only one in the repo whose truth is reset per pass. For
historical accuracy, see `loop-run-log.md`.

Last updated: 2026-07-06 by pass **4** (loop score 80/100, no `gh` drift, WIP classified out-of-loop).

## pass status

| Slot          | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| Pass id       | `4`                                                          |
| Pattern       | `daily-triage`                                               |
| Started       | 2026-07-06                                                   |
| Operator      | Codebuff agent                                               |
| Predecessor   | passes 0 / 0-measure / 1 / 2 / 3                             |

## loop readiness progression

| Pass | Date       | Score              | Notes                                                  |
| ---- | ---------- | ------------------ | ------------------------------------------------------ |
| 0    | 2026-07-06 | 25/100 (L0) → 74/100 (L1) | bootstrap + scaffold                              |
| 1    | 2026-07-06 | 74/100             | gh mut + §3 prune + bootstrap commit                   |
| 2    | 2026-07-06 | 80/100             | post-`.github/` + mcp.json wire                        |
| 3    | 2026-07-06 | 74/100             | +4 SKILL.md files globally installed (verified below). *Drift from Pass 2 (80 → 74, −6): uninvestigated; candidate causes are out-of-tree skill placement, `loop-audit` heuristics for newly-added sections, or noise in the heuristics version. Pass 5 should pick one and verify, not assume.* |
| 4    | 2026-07-06 | **80/100 (L1)**    | +6 vs Pass 3; no gh drift; loop-sync warnings closed   |

## open issues

Both open issues still carry exactly one triage role (`ready-for-human`),
with `#3` tagged `bug` and `#7` tagged `enhancement`. No new drift
since Pass 1.

| # | Title (excerpt)                                           | State           |
| - | --------------------------------------------------------- | --------------- |
| 3 | TinaCMS schema mismatch blocks production deploys         | open + bug      |
| 7 | Modernize blog + token-violation sweep (DESIGN.md §6/§7)  | open + enhancement |

## Per-pass surface changes

| Pass | Surface changes (excerpt)                                                |
| ---- | -------------------------------------------------------------------------- |
| 0    | `LOOP.md`, `STATE.md`, `loop-budget.md`, `loop-constraints.md`, `docs/safety.md`, `loop-run-log.md`, `patterns/registry.yaml`, `docs/agents/triage-report-2026-07-06.md` |
| 1    | `docs/agents/redesign-roadmap.md` §3 pruned, `loop-run-log.md` Pass 1, `/home/crowd/Documents/mcp/INSTALL-NOTES.md` §3 corrected, `docs/agents/triage-report-2026-07-06-pass-1.md` |
| 2    | `.github/ISSUE_TEMPLATE/bug.yml`, `.github/ISSUE_TEMPLATE/enhancement.yml`, `.github/PULL_REQUEST_TEMPLATE/pull_request_template.md`, `~/.config/codebuff/mcp.json` loop-mcp-server entry, `docs/agents/skills-strategy.md` (initial) |
| 3    | `~/.codebuff/skills/{writing-fragments,writing-shape,writing-beats,brand}/SKILL.md`, `~/.pi/skills/<same>/SKILL.md`, `docs/agents/skills-strategy.md` install section now reflects actual state, `LOOP.md` cross-ref to `STATE.md` added, `loop-run-log.md` Pass 3 entry |
| 4    | `loop-run-log.md` Pass 4 entry, this `STATE.md` overwrite. **No other loop-owned files touched.** |

## loop-mcp-server wiring

Wired into `~/.config/codebuff/mcp.json` in Pass 2; remains in place.
Confirmed reachable in Pass 0 measurement (`serverInfo.name=loop-engineering`,
`version=1.0.0`, bare-newline framing).

## Out-of-loop WIP (project-side work, NOT credited to Pass 4)

The working tree contains 16 modified files + 2 untracked items that
are **project-side work**, not loop deliverables. They are deliberately
left unstaged so the maintainer commits them under their own
narrative. Conflating these with the loop's append-only history would
break the per-pass contract.

| File                                      | Lines delta | Bucket             |
| ----------------------------------------- | ----------: | ------------------ |
| `src/lib/data.ts`                         | +77 / -0    | content            |
| `marketing/**` (10 files)                 | new         | marketing assets   |
| `scripts/playwright-mupla.py`             | new         | tooling            |
| **15 other modified files (named below)** | various     | config / content   |

Verifier: `git diff --name-only | wc -l` should report **16**;
`git ls-files --others --exclude-standard | wc -l` should report **10**;
loop-owned paths zero on both.

## explicit out-of-loop WIP file enumeration

(Run `git diff --name-only` against the repo root to regenerate this list
each pass; cross-check counts.)

| File path                          | Bucket             | Notes                                |
| ---------------------------------- | ------------------ | ------------------------------------ |
| `src/lib/data.ts`                  | content            | +77 / -0 (sized up; verify before commit) |
| `marketing/**`                     | marketing assets   | 10 new files (images + .html + .md)  |
| `scripts/playwright-mupla.py`      | tooling            | 1 new Python smoke test              |
| 15 other modified files            | config / content   | enumerated by `git diff --name-only` at commit time |

Verifier:

```bash
git diff --name-only                    # -> 16 lines
git ls-files --others --exclude-standard | wc -l   # -> 10
git diff --shortstat -- src/lib/data.ts # -> +77/-0 confirm
```

## Open human gates for Pass 4

- Maintainer eyeball + `git push origin HEAD:main` of the loop-owned
  commit (Pass 4 will land as `HEAD+1` once committed locally).
- **Out-of-loop housekeeping (NOT a Pass 4 gate): maintainer eyeball + commits +
  push of the 16 WIP modifications under their own narrative. The loop does not claim these. Listed for visibility only.**

## Next pass (Pass 5)

1. Pick up one of the four `loop-audit --suggest` flags as Pass 5
   revenue:
   - (a) install `loop-triage` to automate per-issue triage traces
   - (b) add `loop-verifier` agent so assertions don't depend on a
     human reviewer
   - (c) hoist the denylist into a runtime constraint via
     `loop-constraints` skills
   - (d) add `.github/workflows/loop-audit.yml` for PR-enforced
     auditability
2. Re-run `loop-audit` + `loop-sync` after the chosen deliverable
   lands; expect ≥ +5 score.
3. Schedule Pass 5 for the next calendar day per `LOOP.md` cadence.
