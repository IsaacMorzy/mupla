# loop-budget.md — per-pass resource caps

This file caps every resource the loop can consume **per pass**. The caps
are tight on purpose: `daily-triage` is low-cadence and should leave
plenty of headroom so the kill switches trip on a real anomaly, not on a
busy network.

## Caps

| Resource                          | Cap per pass | Source / rationale                                             |
| --------------------------------- | -----------: | -------------------------------------------------------------- |
| Wall clock on loop ops            | 2 h          | matches `daily-triage`'s cadence window in `LOOP.md`           |
| LLM tokens (this agent)           | 200 k        | one Codebuff Sonnet-tier window                               |
| Approximate LLM cost              | $5 USD       | estimate via `loop-cost --pattern daily-triage --level L1 --json` |
| `gh` rate-limit units             | 50           | well under GitHub's 5 000/h primary cap                       |
| Files written per pass            | one each of the loop-owned kinds: `STATE.md`, `LOOP.md`, `loop-budget.md`, `loop-run-log.md`, `docs/safety.md`, `loop-constraints.md`, `patterns/registry.yaml`, plus one `docs/agents/triage-report-YYYY-MM-DD.md`. Sums to 8 only on a bootstrap pass; later passes overwrite STATE/run-log and skip the rest. | matches the loop scaffolding footprint (STATE, LOOP, budget, run-log, safety, constraints, registry, report) |
| `git push` ops                    | **0**        | gated human-only — see `docs/safety.md`                       |
| `gh issue close` ops              | **0**        | gated human-only                                              |
| `gh issue edit --remove-label`    | **0**        | gated human-only                                              |
| `vercel deploy --prod`            | **0**        | gated by TinaCloud hook; agent does not run it                |

## Auto-scaling of caps

If `loop-audit . --json` shows the readiness score **rising**, the file /
ops caps naturally expand as new patterns register (`patterns/registry.yaml`).
A drop in score tightens nothing automatically; the pass *documents* the
drop and recommends a human review.

## Cost estimation, canonical

```bash
loop-cost --pattern daily-triage --level L1 --json
```

Run this before each pass to record the planned spend in
`loop-run-log.md` (`Cost estimate:` line). The JSON keys are stable per
the upstream README; readers can diff consecutive passes.

## Kill-switch thresholds

If any of the following trip, the pass aborts:

| Trigger                                     | Action                                                   |
| ------------------------------------------- | -------------------------------------------------------- |
| Wall clock > 90 % of cap (≥ 1.8 h)          | abort; mark `STATE.md` `ABORTED-CLOCK`; alert owner      |
| Tokens > 90 % of cap (≥ 180 k)              | abort; mark `STATE.md` `ABORTED-TOKENS`; alert owner      |
| `gh` rate-limit units used > 90 %           | back off, sleep until next hour; do NOT retry            |
| 3 consecutive passes with score regression  | escalate to `@IsaacMorzy`; halt loop until reviewed      |
| Any forbidden op attempted (push / close)   | abort; record in `loop-run-log.md`; hard halt            |

The thresholds are deliberately *non-zero* so a hanging op is caught
before total budget exhaustion, not after.
