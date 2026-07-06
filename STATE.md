# STATE.md — current pass progress

**Read at the start of every pass; overwrite at the end.**
This file is the only one in the repo whose truth is reset per pass. For
historical accuracy, see `loop-run-log.md`.

Last updated: **2026-07-06** by pass **1** (first post-bootstrap pass).

## Pass status

| Slot          | Value                                          |
| ------------- | ---------------------------------------------- |
| Pass id       | `1`                                            |
| Pattern       | `daily-triage`                                 |
| Started       | 2026-07-06                                     |
| Operator      | Codebuff agent                                 |
| Predecessor   | pass 0 (bootstrap) + pass 0 measurements (74/77) |

## Loop readiness progression

| Pass | Date       | Score          | Notes                                                |
| ---- | ---------- | -------------- | ---------------------------------------------------- |
| 0    | 2026-07-06 | 25/100 (L0) → 74/100 (L1) | bootstrap + loop CLIs installed |
| 1    | 2026-07-06 | 74/100 (L1) → TBD | gh mutations + §3 prune + scaffolding commit |

## Open issues (post `gh issue edit --remove-label ready-for-agent`)

| #  | Title                                                  | Real labels now                    |
| -- | ------------------------------------------------------ | ---------------------------------- |
| 3  | TinaCMS schema mismatch blocks production deploys      | `bug`, `ready-for-human`            |
| 7  | Modernize blog + token-violation sweep                 | `enhancement`, `ready-for-human`    |

Both issues now carry **exactly one** triage role, in line with the
state machine in `docs/agents/triage-labels.md`. The prior dual-role
drift is closed; receipt of pass 1's two `gh issue edit` snippets was
confirmed via `gh issue view` after the mutation.

## Bootstrap commit

`2396889` on `origin/main` carries the eight loop files. Pass 1's doc
amendments (§3 prune, run-log Pass 1 entry, etc.) will follow in a
follow-up commit.

## loop-mcp-server diagnosis (was a known gap)

The previous pass noted loop-mcp-server's init was not validated
because no response was observable. This pass confirms the binary
**talks MCP correctly** under bare-newline framing — same quirk as
`@playwright/mcp@0.0.77` documented earlier. `serverInfo` =
`loop-engineering` `1.0.0`. Not yet wired into `~/.config/codebuff/mcp.json`;
viewed as out of scope for daily-triage maintenance.

## Open human gates for pass 1

None new on the open issues (the prior snippets were applied this pass).
Future gates: maintainer commit + push of the pass-1 doc amendments.

## Next pass (pass 2)

1. Re-run `loop-audit . --json` and `loop-sync . --dry-run -v`; record
   in `loop-run-log.md` "Pass 2".
2. Optionally wire `loop-mcp-server` into `~/.config/codebuff/mcp.json`.
3. Optionally add `.github/ISSUE_TEMPLATE` + `.github/PULL_REQUEST_TEMPLATE`
   (loop-audit recommendations for L3 readiness).
