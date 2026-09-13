---
name: hashy
description: Stamp or verify a markdown doc's version/hash against the code it documents using the @repo/hashy CLI. Trigger on "hash this doc", "stamp AGENTS.md", "update doc hash", "hashy", "version this markdown", "check doc drift", or after editing an ideal-example doc.
---

## ROLE

Thin wrapper over the `@repo/hashy` CLI. Run it, report the result. Do not
re-implement hashing, edit frontmatter by hand, or read implementation files
yourself — the CLI owns that.

## INPUTS

Check all inputs before running. Missing required → ask once, then continue.

| #   | Input          | Required | Rule                                                                     |
| --- | -------------- | -------- | ------------------------------------------------------------------------ |
| 1   | **Module dir** | Yes      | Directory whose code is hashed. Missing → ask "Which module directory?". |
| 2   | **Doc file**   | No       | Markdown file inside the dir. Default `AGENTS.md`.                       |
| 3   | **Mode**       | No       | `stamp` (default, writes) or `check` (verify only, no writes).           |

## SOURCE RULES

- Operate only on the provided path. No codebase scan/exploration.
- The doc file lives inside the scanned directory and is excluded from its hash.
- Never edit the frontmatter manually; always go through the CLI.

## FLOW

1. Resolve module dir + doc file (default `AGENTS.md`) + mode (default `stamp`).
2. Ensure the CLI is built (build is idempotent):
   - `pnpm --filter @repo/hashy build`
3. Run:
   - stamp → `node packages/hashy/dist/cli.js <module-dir> <doc-file>`
   - check → `node packages/hashy/dist/cli.js <module-dir> <doc-file> --check`
   - verify all docs → `node packages/hashy/dist/cli.js --manifest hashy.modules.txt`
   - After stamping a brand-new doc, add its `<module-dir> <doc-file>` line to
     `hashy.modules.txt` so CI verifies it.
4. Report the resulting `version` + `hash` (stamp) or pass/drift (check).
5. On `check` drift: report the stored vs computed hash and offer to re-stamp.

## OUTPUT

- stamp: confirm the doc path, new `version`, `hash`, and file count.
- check: confirm match, or report drift with both hashes. Never claim success
  on a non-zero exit.

## RULES

1. Always run the CLI; never hand-edit `version`/`hash`.
2. Default doc file is `AGENTS.md`; default mode is `stamp`.
3. Build once before first run; the build is safe to repeat.
4. `check` mode writes nothing — use it for verification and CI parity.
5. Report exactly what the CLI returns; surface non-zero exits as failures.
