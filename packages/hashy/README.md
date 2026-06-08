# @repo/hashy

Version + hash markdown docs against the code they describe.

A documented module keeps a markdown file (e.g. `AGENTS.md`) with `version` and
`hash` in its frontmatter. `hashy` recomputes a stable hash over the module's
implementation files; if it differs from the stored hash, the doc is stale.

```yaml
---
version: 1.0
hash: 9f2c… (generated from the module's files)
---
```

## Usage

```bash
# Stamp / refresh frontmatter after editing a module's docs:
pnpm --filter @repo/hashy build
node packages/hashy/dist/cli.js <module-dir> <markdown-file>

# Verify only (CI gate) — exits non-zero on drift, writes nothing:
node packages/hashy/dist/cli.js <module-dir> <markdown-file> --check
```

Example:

```bash
node packages/hashy/dist/cli.js apps/romantic-app/src/modules/user-profile-setup AGENTS.md
```

## CI / manifest mode

CI verifies every documented module in one pass from a manifest
(`hashy.modules.txt` at the repo root). Each line is `<module-dir> [<doc-file>]`
relative to the manifest; `#` starts a comment. `--manifest` always runs in check
mode and exits non-zero if any doc is out of sync.

```bash
node packages/hashy/dist/cli.js --manifest hashy.modules.txt
```

Add a module to `hashy.modules.txt` once it has an `AGENTS.md` stamped by `hashy`.

The markdown file lives inside the scanned directory and is excluded from its own
hash. `node_modules`, `dist`, `.git`, `.turbo`, and `__snapshots__` are ignored.

On stamp, the minor version bumps (`1.0` → `1.1`) whenever the hash changes; an
unchanged hash leaves the version untouched.
