#!/usr/bin/env bash
# page-budget.sh - in-repo page-section budget auditor for mupla-front.
#
# Counts `_template:` blocks in each `src/content/page/*.mdx` and warns if
# any page falls below the per-pass section threshold (default 6, lifted
# from STATE.md `## Next pass (Pass 15)` bullet 2). Emits a markdown
# table on stdout so the agent (or maintainer) can pipe it directly into
# the audit brief.
#
# Threshold follows by design:
#   - Each page has a YAML frontmatter with a `blocks:` array of typed
#     content blocks (`_template: hero`, `_template: features`, etc.).
#   - The current surface averages ~7 blocks per page; < 6 typically means
#     the page is a thin stub or a single-purpose surface (e.g., 404,
#     oxfam carve-out). Pages with < 6 blocks are flagged so the maintainer
#     can confirm intent (some pages are deliberate one-pagers).
#
# Run from any working dir:
#   bash scripts/page-budget.sh                  # threshold 6, audit repo at .
#   bash scripts/page-budget.sh 4                # threshold 4, audit repo at .
#   bash scripts/page-budget.sh /path/to/repo    # threshold 6, audit different repo
#   bash scripts/page-budget.sh /path/to/repo 4  # threshold 4, audit different repo
# (Caller passing a path as $1 wins; matches the loop-audit-local.sh convention.)
#
# Exit codes:
#   0  every page at or above threshold (and pages dir is non-empty)
#   1  one or more pages below threshold, or pages dir is empty
#   2  caller-supplied arg is neither a directory nor a number (EX_USAGE)
#
# No side effects beyond stdout + exit code. Idempotent.
# Bash 3.x compatible (no `mapfile`; uses a `while read` loop instead
# so macOS default bash 3.2 still works).
# Uses `printf -- 'fmt'` defensively to dodge the bash builtin quirk where
# a format string starting with `-` is interpreted as option args.

set +e

# Detect whether arg 1 is a path (directory) or a threshold (integer).
# Falls loud on ambiguous input (neither a directory nor a non-negative integer)
# so caller doesn't silently get the wrong repo's table.
case "${1:-}" in
  "")          ROOT="."; THRESHOLD="6" ;;
  *[!0-9]*)    if [ -d "${1}" ]; then
                 ROOT="${1}"
                 THRESHOLD="${2:-6}"
               else
                 echo "page-budget.sh: arg '${1}' is neither an existing directory nor an integer threshold" >&2
                 exit 2  # EX_USAGE
               fi ;;
  *)           ROOT="."; THRESHOLD="${1}" ;;
esac

# Symmetric fail-loud: if the resolved ROOT doesn't have a pages dir, this is
# also a usage error (caller's cwd is wrong, or arg typo). Same exit 2 as the
# explicit-bad-arg branch above.
if [ ! -d "$ROOT/src/content/page" ]; then
  echo "page-budget.sh: $ROOT/src/content/page does not exist." >&2
  echo "  Run from the mupla-front repo root, or pass ROOT explicitly:" >&2
  echo "    bash scripts/page-budget.sh                                  # threshold 6, audit repo at ." >&2
  echo "    bash scripts/page-budget.sh /path/to/mupla-front [threshold]" >&2
  exit 2  # EX_USAGE
fi

# Snapshot the per-page counts first, then walk twice (count + warn) for
# clean table presentation without an associative array (bash 3.x compat).
declare -a page_paths=()
declare -a page_counts=()
declare -a page_warns=()

page_paths=()
while IFS= read -r line; do
  page_paths+=("$line")
done < <(find "$ROOT/src/content/page" -maxdepth 1 -type f -name '*.mdx' | sort)

worst_status="PASS"

printf -- '| page | sections | threshold | status |\n'
printf -- '| ---- | -------: | --------: | :----- |\n'

for path in "${page_paths[@]}"; do
  rel="${path#$ROOT/}"
  count=$(grep -c '_template:' "$path" 2>/dev/null || echo "0")
  status="PASS"
  if [ "$count" -lt "$THRESHOLD" ]; then
    status="WARN"
    page_warns+=("$rel: $count (< $THRESHOLD)")
    worst_status="WARN"
  fi
  page_counts+=("$count")
  printf -- '| %s | %s | %s | %s |\n' "$rel" "$count" "$THRESHOLD" "$status"
done

printf -- '\n'

n_pages=${#page_paths[@]}
n_warn=${#page_warns[@]}

# Latent-bug fix: a pages dir exists but is empty (e.g. maintainer renamed
# or gitignored the dir). Don't silently PASS-with-zero-pages; that masks
# the regression. Force WARN + non-zero exit when n_pages is 0.
if [ "$n_pages" -eq 0 ]; then
  worst_status="WARN"
  page_warns+=("(none): pages dir exists but contains no *.mdx files in $ROOT/src/content/page")
fi

# Defend against bash 5+'s `printf '%s\n' "${empty[@]}"` quirk where an
# empty array expansion produces "printf: --: invalid option" on stderr.
# (Defensive only - the n_pages check above forces non-empty by WARN, so the
# else branch here is rare in practice but kept for portability.)
if [ "$n_pages" -gt 0 ]; then
  total=$(printf '%s\n' "${page_counts[@]}" | awk 'BEGIN{s=0} {s+=$1} END{print s}')
  mean=$(printf '%s\n' "${page_counts[@]}" | awk 'BEGIN{s=0;n=0} {s+=$1;n++} END{printf "%.1f", s/n}')
  max=$(printf '%s\n' "${page_counts[@]}" | sort -n | tail -1)
  min=$(printf '%s\n' "${page_counts[@]}" | sort -n | head -1)
else
  total=0
  mean=0.0   # decimal-formatted for type-consistency with the populated case
  max=0
  min=0
fi

printf -- 'Summary\n'
printf -- '-------\n'
printf -- '  pages audited     : %s\n' "$n_pages"
printf -- '  sections total    : %s\n' "$total"
printf -- '  sections mean     : %s\n' "$mean"
printf -- '  sections max      : %s\n' "$max"
printf -- '  sections min      : %s\n' "$min"
printf -- '  threshold         : %s sections\n' "$THRESHOLD"
printf -- '  pages below       : %s\n' "$n_warn"
printf -- '  overall status    : %s\n' "$worst_status"
printf -- '\n'

if [ "$n_warn" -gt 0 ]; then
  printf -- 'Below threshold (intentional or stub?):\n'
  for warn in "${page_warns[@]}"; do
    printf -- '  - %s\n' "$warn"
  done
  printf -- '\n'
fi

if [ "$worst_status" = "WARN" ]; then
  exit 1
fi
exit 0
