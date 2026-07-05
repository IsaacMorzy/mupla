# Issue tracker

## Where issues live

GitHub Issues on [IsaacMorzy/mupla](https://github.com/IsaacMorzy/mupla). Authoritative commands:

### Read

```bash
gh issue list --repo IsaacMorzy/mupla --state open
gh issue list --repo IsaacMorzy/mupla --label <name>
gh issue view <number> --repo IsaacMorzy/mupla
gh issue view <number> --repo IsaacMorzy/mupla --comments
```

### Create

```bash
gh issue create --repo IsaacMorzy/mupla \
  --title "<title>" \
  --body "<body>" \
  --label "needs-triage"
```

### Re-label (the only state-changer the `triage` skill applies)

```bash
gh issue edit <number> --repo IsaacMorzy/mupla --add-label "<label>"
gh issue edit <number> --repo IsaacMorzy/mupla --remove-label "<label>"
```

### Close after resolution

```bash
gh issue close <number> --repo IsaacMorzy/mupla --comment "wontfix: <reason>"
```

## PRs as a triage surface

External PRs (from non-collaborators) are pulled into the same `/triage` queue as GitHub Issues and run through the same five canonical labels. The `triage` skill distinguishes them by querying PRs separately:

```bash
gh pr list --repo IsaacMorzy/mupla --state open \
  --json number,title,author,createdAt,isDraft,labels
```

Collaborators' own in-flight PRs are intentionally excluded from `/triage` — they don't need triage labels; reviewers handle them in-repo. The `triage` skill filters out PRs whose `author.login` is in the repo's collaborator list when triaging.

## Auth

The `gh` CLI is authenticated via the GitHub PAT auth flow. `gh auth status --repo IsaacMorzy/mupla` returns the active user. The PAT lives in `~/.config/gh/hosts.yml`; rotate via `gh auth logout && gh auth login --with-token` if it leaks.

## When this doc changes

Re-run `setup-matt-pocock-skills` if you switch trackers (e.g. GitHub → GitLab, or GitHub → local markdown). For in-place edits to commands or label names, just edit this file and update `docs/agents/triage-labels.md` to match.
