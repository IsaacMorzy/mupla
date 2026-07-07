# Pass 15 — 2026-07-07 (page-budget audit script + Pages collection sweep)

Brief companion to `docs/agents/writing-pass-2026-07-07.md` (Pass 14), `…-14.1.md` (Pass 14.1 corrective), `…-14.2.md` (Pass 14.2 review-flag closures). Closes Bucket C #18 T2 from STATE.md `## Next pass (Pass 15)` bullet 2.

| Slot      | Value                                                          |
| --------- | -------------------------------------------------------------- |
| Operator  | agent (Buffy)                                                  |
| Pattern   | `daily-triage` + `matt-pocock-skill` (T2 page-hygiene audit)   |
| Started   | 2026-07-07                                                     |
| Status    | COMPLETE — `scripts/page-budget.sh` shipped + Pages collection audited (10/10 pages PASS at threshold 6) |
| Score     | +0 (audit-class script per `## Onward contract` bullet 4 — `scripts/` not `bin/`; non-scoring) |
| Tokens    | ~25k (in Pass 15 budget per STATE.md)                          |

## What this pass shipped

- **`scripts/page-budget.sh`** (NEW, ~120 lines, bash 3.x portable) — counts `_template:` blocks per MDX in `src/content/page/`, warns if any page falls below the per-run threshold (default 6). 3-tier exit code: `0 = clean PASS` / `1 = WARN (incl. n_pages=0)` / `2 = EX_USAGE (bad arg OR pages dir missing)`. Mirrors the `loop-audit-local.sh` `set +e` + score-style pattern. Idempotent, no side effects beyond stdout + exit code.
- **`docs/agents/page-budget-2026-07-07.md`** (this file) — audit brief.

## Audit result (canonical run: threshold 6)

```
| page                              | sections | threshold | status |
| --------------------------------- | -------: | --------: | :----- |
| src/content/page/about.mdx        |        6 |         6 | PASS   |
| src/content/page/contact.mdx      |        7 |         6 | PASS   |
| src/content/page/donate.mdx       |        8 |         6 | PASS   |
| src/content/page/faq.mdx          |        7 |         6 | PASS   |
| src/content/page/get-involved.mdx |        7 |         6 | PASS   |
| src/content/page/home.mdx         |        7 |         6 | PASS   |
| src/content/page/privacy.mdx      |        8 |         6 | PASS   |
| src/content/page/programs.mdx     |        6 |         6 | PASS   |
| src/content/page/team.mdx         |        7 |         6 | PASS   |
| src/content/page/terms.mdx        |        8 |         6 | PASS   |

Summary
  pages audited     : 10
  sections total    : 71
  sections mean     : 7.1
  sections max      : 8
  sections min      : 6
  threshold         : 6 sections
  pages below       : 0
  overall status    : PASS
```

10/10 pages PASS at the canonical threshold of 6 blocks. Surface mean is 7.1, max 8 (`donate`, `privacy`, `terms` — the legal/transactional pages with the most content sections), min 6 (`about`, `programs`). The 6-section floor is well-supported; relaxed thresholds would invite sparse stubs.

## Stricter run (threshold 8)

For comparison, the audit script flips cleanly when the threshold is raised. At 8: `donate`, `privacy`, `terms` still pass (these have exactly 8 sections); the other 7 pages WARN. Emits the warn-list in markdown and exits 1. Useful when the maintainer wants to gate new copy on a richer content surface.

## How to invoke

```
bash scripts/page-budget.sh                                 # threshold 6, audit repo at .
bash scripts/page-budget.sh 4                               # threshold 4, audit repo at .
bash scripts/page-budget.sh /path/to/mupla-front             # threshold 6, audit different repo
bash scripts/page-budget.sh /path/to/mupla-front 8           # threshold 8, audit different repo
```

Caller passing a directory path as `$1` triggers the directory-check branch; an integer `$1` is treated as a custom threshold; an ambiguous arg (neither a directory nor an integer) errors loud with `arg '...' is neither an existing directory nor an integer threshold` and exits 2 (EX_USAGE). Matches the `loop-audit-local.sh` `ROOT="${1:-.}"` convention.

## Reviewer-flag closure history (this pass)

The script went through 4 code-reviewer iterations before landing:

1. **Docstring/signature mismatch + bash 4+ `mapfile`** (B + C of the first review). Fixed: `THRESHOLD="${1:-6}"`, ROOT hardcoded to `.`; `mapfile` replaced with `while IFS= read -r line; do ... done < <(find ... | sort)`. Bash 3.2 (macOS default) compat restored.
2. **Hardcoded ROOT lost `loop-audit-local.sh` convention** (F of the first review). Fixed: dual-mode root/threshold detection with explicit fail-loud on ambiguous args. `bash scripts/page-budget.sh [threshold | /path] [threshold]` is the canonical invocation.
3. **Silent-fallback on typo'd path** (C of the second review). Fixed: case-statement partition (`"" / *[!0-9]* / *)`) that explicitly errors `arg '${1}' is neither an existing directory nor an integer threshold` and exits 2 (EX_USAGE) when the path doesn't exist.
4. **Stderr noise `printf: --: invalid option` at line 106** (root cause of multiple iterations). The format string `'-------\n'` was being mis-parsed by bash's printf builtin as `-- -------\n` (option-terminator + unknown flag). Fixed: defensive `printf -- 'fmt'` prefix on every literal printf call across the file. Plus the symmetric `exit 2` for the wrong-cwd branch (was silent `exit 0`), `mean=0.0` for type-consistency with the populated case, and the latent `n_pages=0 → WARN + exit 1` guard so an empty pages dir doesn't silently PASS.

Final reviewer pass confirmed A-F all clean (B/D/C non-issues; F is a future-follow-up `--allow-empty` flag, deliberately unsuppressed for Pass 15's regression-detection goal).

## Verification (basher output)

```
=== (1) chmod === OK
=== (2) bash -n === OK
=== (3) run ROUTE + threshold 6 (clean PASS) === exit: 0
=== (4) run ROUTE + threshold 8 (stricter WARN) === exit: 1
=== (5) run from non-repo cwd + threshold 6 (was silent-exit-0; should be exit 2 now) === exit: 2
=== (6) run with bad path (exit 2) === exit: 2
```

Stderr invariant: **zero** `printf: --: invalid option` lines anywhere in the canonical-run steps 3-4. Steps 5-6 stderr carries only the fail-loud messages from the case-statement and the pages-dir guard — both are the intended diagnostic surface.

## Open human gates

Per `docs/safety.md`, the agent does NOT push to `origin/main` or trigger `vercel deploy --prod`. The local commit lives on a local branch; the maintainer pastes `bash bin/prep-push.sh` from a creds-loaded TTY to fast-forward `origin/main` and trigger Vercel auto-deploy.

## Backlog (next-pass candidates, not in scope for Pass 15)

- **Hardening the audit into a dogfooded cron**: `.github/workflows/page-budget.yml` to run nightly, write to `docs/agents/page-budget-2026-07-XX.md`, fail the workflow on WARN. Defer until the maintainer adds the cron gate per Pass 11 patterns.
- **`--allow-empty` flag**: opt-in escape hatch for the `n_pages=0 → WARN + exit 1` branch. Suggested one-liner: `if [ \"${ALLOW_EMPTY:-}\" = \"1\" ] && [ \"$n_pages\" -eq 0 ]; then worst_status=\"PASS\"; fi`. Granular guard for transient empty-states (mid-CMS sync).
- **Bin classification**: per `STATE.md` `## Onward contract` bullet 4, `bin/` is for **gates** (push, deploy, close-issue gates). `scripts/page-budget.sh` is a **checker**, not a gate, so `scripts/` placement is consistent with `loop-audit-local.sh` / `axe-core.sh`. Don't relocate.
- **Bucket C #16 (contact-block rewire)** is still the highest-ROI T1 — the placeholder on `contact.mdx` + `faq.mdx` is the only remaining bucket-C item that produces visitor-visible drift.
