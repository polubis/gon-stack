Each session ends with one decision entry in root `decisions/`.

Commit adds (stages) exactly one new file in `decisions/`, never more. Pure renames git detects do not count. Commit touching only `decisions/` files (move, edit) needs no new entry. `__log__/` dirs are gone: new file there = error.

Path `decisions/YYYYMMDD-HHmmss-<ticket>-<scope-prefix>-<verb>-<object>.md`:

- `YYYYMMDD-HHmmss`: real local datetime when the entry is written. No `NNNN` numbers: parallel PRs never clash on a number, so rebasing never renames entries.
- `<ticket>`: same as frontmatter `ticket` (`none` or `ABC-123`).
- slug: kebab-case `[a-z0-9-]`, 8-60 chars. Starts with first `scope` segment (`parka/dashboard` -> `parka-`), then imperative verb from allow-list, then object.
- no two entries share the same `ticket` and slug, whatever the datetime.

Content: YAML frontmatter, blank line, nested `- ` list. Nothing else (no heading, prose, code fence, blank line).

Frontmatter, flat `key: value`. Plain scalar must not contain `: ` or ` #`, else use `"double quotes"`:

- required `ticket`: `none` or id like `ABC-123`, equal to the file name part.
- required `scope`: lowercase kebab segments joined by `/`, must match allowed patterns in `.nitpick/config.ts`.
- required `summary`: one line, 10-70 chars.
- required `why`: one line, 10-200 chars.
- optional `date`: `YYYY-MM-DD`.
- optional `supersedes`: full name of existing older entry without `decisions/` and `.md`, e.g. `20261009-093000-none-parka-order-tiles`.
- optional `tags`: kebab-case list, `[a, b]` or `- a` lines.
- optional metrics, only if known: `models` (list), `inputTokens`, `outTokens`, `cost`, `workTimeInMinutes`.

Body: 1-40 bullet lines, max 240 chars each. Nest with 2 spaces, one level deeper at most. Facts only, drop test-count noise.
