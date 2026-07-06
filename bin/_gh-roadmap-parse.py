#!/usr/bin/env python3
"""bin/_gh-roadmap-parse.py

Standalone markdown-table parser for the mupla-front triage roadmap.

Reads a roadmap file path from sys.argv[1] and emits TSV (tab-separated
title, body) pairs to stdout - one pair per data row, one pair per line.
Empty lines are skipped. Designed to be called from bash as:

    python3 bin/_gh-roadmap-parse.py docs/agents/triage-roadmap-2026-07-06.md

Why a separate file: prior attempts to embed Python inside a bash heredoc
extracted fewer rows than expected, and isolating the parser into its own
file eliminates heredoc / bash-escape variables entirely.

Strategy:
1. Walk the file line-by-line. Identify divider rows matching the markdown
   table separator regex (one or more `|---|` style cells).
2. For each divider, the line above is treated as the header. Lines below
   the divider that start with `|` are data rows (until a non-table line).
3. Only tables with >= 9 columns and a 'Title' header cell are processed.
4. For each data row, the first cell (must look like a ticket number -
   plain digits or bold-marker digits) identifies a real ticket. Title
   comes from the column labelled 'Title', and body from the column
   labelled 'Body template' / 'Body' / 'Description' (or the last column
   as fallback).
5. Output one TSV line per (title, body) pair to stdout.

Note on Pass 9.1 corruption artefact: the roadmap file currently contains
literal `\\n` text (escaped backslash-n sequences) within what should be
real newline separators between back-to-back bucket tables. This parser
normalises those literal `\\n` text tokens to actual newline characters
before splitting - this is what makes Buckets B/C/D/E parse.
"""

import sys
import re
from pathlib import Path


def parse_roadmap(path):
    """Parse the markdown file at `path` and return a list of (title, body) tuples."""
    # Normalise literal `\n` text (a Pass 9.1 corruption artefact where
    # backslash-n sequences got embedded as text in some lines instead of
    # actual newlines). Without this replace, Buckets B/C/D/E never
    # enumerate because the dividers + headers for those buckets are
    # squashed into one giant physical line with literal `\n` text.
    #
    # Pattern (2 chars on disk): `\n` (backslash + n).
    # Replacement (1 char on disk): actual newline.
    text = path.read_text(encoding='utf-8').replace('\\n', '\n')
    lines = text.split('\n')

    # divider regex: a line that consists ONLY of cell-pipe pairs whose cells
    # are dashes optionally wrapped with colons. e.g. /|----|----|----|/
    divider_re = re.compile(r'^\|\s*(?::?-{2,}:?\s*\|)+\s*$')
    # first-cell regex: a number, possibly wrapped in ** (markdown bold) markers.
    # accepts "1", "**31**", "**1**"; rejects "#", "Pass", "".
    first_re = re.compile(r'^\*?\*?[0-9]+\*?\*?$')

    tables = []
    i = 0
    n = len(lines)
    while i < n:
        line = lines[i]
        stripped = line.strip()
        if divider_re.match(stripped):
            # Header is the line IMMEDIATELY above the divider (markdown
            # convention). Walk back past blank lines ONLY - never past another
            # `|`-starting line, since that would be a data row from a prior
            # table and is NOT a header. If lines[i-1] is non-blank and
            # non-`|`-starting, fall back to walk-back past the divider of the
            # previous table (re-check by skipping divider-lines too).
            k = i - 1
            while k >= 0 and not lines[k].strip():
                k -= 1
            if k >= 0 and lines[k].lstrip().startswith('|') and lines[k].count('|') >= 10:
                header_line = lines[k]
                # Walk down from i+1 collecting consecutive `|` lines.
                rows = []
                j = i + 1
                while j < n and lines[j].lstrip().startswith('|'):
                    rows.append(lines[j])
                    j += 1
                tables.append((header_line, rows))
                i = j
                continue
        i += 1

    out = []
    for header_line, data_rows in tables:
        header_cells = [c.strip() for c in header_line.strip().strip('|').split('|')]
        if 'Title' not in header_cells:
            continue
        title_idx = header_cells.index('Title')
        body_idx = None
        for label in ('Body template', 'Body', 'Description'):
            if label in header_cells:
                body_idx = header_cells.index(label)
                break
        if body_idx is None:
            body_idx = len(header_cells) - 1
        for row in data_rows:
            rcells = [c.strip() for c in row.strip().strip('|').split('|')]
            if len(rcells) <= max(title_idx, body_idx):
                continue
            first = rcells[0]
            if not first_re.match(first):
                continue
            title = rcells[title_idx]
            body = rcells[body_idx]
            if not title or not body:
                continue
            out.append((title, body))

    return out


def main():
    if len(sys.argv) < 2:
        print('usage: _gh-roadmap-parse.py <path/to/roadmap.md>', file=sys.stderr)
        sys.exit(2)
    path = Path(sys.argv[1])
    if not path.is_file():
        print('_gh-roadmap-parse.py: not a file: %s' % path, file=sys.stderr)
        sys.exit(2)
    pairs = parse_roadmap(path)
    for title, body in pairs:
        # TSV-safe: a tab in body would split it again. Replace with 4 spaces.
        body_safe = body.replace('\t', '    ')
        sys.stdout.write(title + '\t' + body_safe + '\n')


if __name__ == '__main__':
    main()
