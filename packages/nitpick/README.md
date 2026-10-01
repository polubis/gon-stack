# @repo/nitpick

Shared CI/CD checks and tool plugins (ESLint later), consumed by apps and
packages so the code is written once. Typed config: `nitpick.config.mts` at repo
root (`defineConfig`), one top-level key per check. Each check lives in its own
file (`src/hash.ts`, `src/manifests.ts`, ...); `src/cli.ts` only dispatches.

`nitpick` (no args) runs every configured check in parallel; `nitpick <check>`
runs one. Failures print `Problem / Expected / Found / Fix` blocks on stderr.
In Turborepo it is the cached root task `//#nitpick`.

## `hash`

Detects real code changes vs. the last accepted state. Target = directory
(all matching files) or single file. The doc next to it (default `AGENTS.md`)
stores `hash:` in frontmatter (only that value is rewritten on `--write`).
Drift → error listing changed files (from git); update the doc with the
`hasher` skill, then stamp.

```ts
import { defineConfig } from '@repo/nitpick';

export default defineConfig({
  hash: {
    include: [/\.(tsx?|css)$/], // optional, relative to target
    exclude: [/\.stories\.tsx$/],
    targets: [
      { path: 'apps/x/src/modules/foo' }, // exact dir or file
      { match: /^apps\/x\/src\/modules\/[^/]+$/, doc: 'AGENTS.md' }, // every hit
    ],
  },
});
```

```bash
pnpm --filter @repo/nitpick build
pnpm nitpick hash [path...]          # check
pnpm nitpick hash [path...] --write  # stamp
```

## `manifests`

Every workspace `package.json` is valid JSON with a unique, non-empty `name`.
`manifests: { ignore: ['name'] }` allows intentional duplicates.

## `outdated`

Counts unique outdated package names (npm-check-updates, all workspaces +
root). A single outdated package never fails. If the registry is unreachable it
warns instead of failing. Give one rule or a list; each rule has its own
`target` (`patch`, `minor`, `latest`, ...), thresholds and `ignore`, and is
reported separately. One `ncu` run per distinct target, in parallel.

```ts
outdated: [
  { target: 'minor', warn: 5, fail: 12 },
  { target: 'latest', warn: 3 }, // majors count too; warn only
];
```

No `warn`/`fail` on a rule = warn 5 / fail 12. Setting only one disables the other.

## `audit`

Runs `pnpm audit --json` once and evaluates it per rule. Give one rule or a
list; each rule has its own `level` (severity and above: `low`, `moderate`,
`high`, `critical`), `warn`/`fail` thresholds (unique vulnerable package names)
and its own `ignore` (package names or advisory ids). Reported separately, with
package, severity, patched versions, details URL and dependency path.
A rule with neither `warn` nor `fail` fails on the first vulnerable package;
setting only one disables the other. Unreachable registry = warning, not failure.

```ts
audit: [
  { level: 'high', fail: 1 },
  { level: 'low', warn: 1, ignore: ['some-pkg'] }, // ignore + reason here
];
```

## `log`

Per commit, per owning folder. Every commit in `origin/main..HEAD` (hard-coded
base, no env var) is checked on its own; `--staged` checks the index as one
pending commit. When nothing is ahead of `origin/main` (HEAD is main, e.g. after
a push to main) the tip commit is checked instead. Each changed non-exempt file
belongs to the nearest folder at or above it that has a `__log__` (the repo
root is the fallback). For every owning folder touched by the commit, the
commit must **add at least one new, valid** `__log__/NNNN-*.md` there
(template: `.claude/templates/task-log.md`). A root change is checked at the
root `__log__`, a change in `apps/parka` at `apps/parka/__log__`, and so on; an
entry in another folder does not count. Not per file. Merge commits are
skipped; exempt files (`.md`, lockfile, images, `__log__`) need no entry.
Replaces `scripts/log-check.mjs`.

Where it runs: inside `//#nitpick`, in the husky pre-push hook (`pnpm ci:verify`), in the Verify step of `pr-ci.yml` (all PR commits) and of `deploy-parka.yml` (tip commit, after a push to `main` that matches its path filter). Duplicate runs are accepted on purpose. `nitpick log --staged` stays available for manual use.

```ts
log: {
  // exempt: [/\.md$/], minBodyLength: 40
}
```
