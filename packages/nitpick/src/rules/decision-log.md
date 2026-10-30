Each session ends with one decision entry in root `decisions/`.

Commit adds (stages) exactly one new file in `decisions/`, never more. Pure renames git detects do not count. Commit touching only `decisions/` files (move, edit) needs no new entry. `__log__/` dirs are gone: new file there = error.

Path `decisions/NNNN-<scope-prefix>-<verb>-<object>.md`:

- `NNNN`: 4 digits, next free number (max existing + 1).
- slug: kebab-case `[a-z0-9-]`, 8-60 chars. Starts with first `scope` segment (`parka/dashboard` -> `parka-`), then imperative verb from allow-list, then object.

Content: YAML frontmatter, blank line, nested `- ` list. Nothing else (no heading, prose, code fence, blank line).

Frontmatter, flat `key: value`. Plain scalar must not contain `: ` or ` #`, else use `"double quotes"`:

- required `ticket`: `none` or id like `ABC-123`.
- required `scope`: lowercase kebab segments joined by `/`, must match allowed patterns in `.nitpick/config.ts`.
- required `summary`: one line, 10-70 chars.
- required `why`: one line, 10-200 chars.
- optional `date`: `YYYY-MM-DD`.
- optional `supersedes`: `NNNN` of existing older entry.
- optional `tags`: kebab-case list, `[a, b]` or `- a` lines.
- optional metrics, only if known: `models` (list), `inputTokens`, `outTokens`, `cost`, `workTimeInMinutes`.

Body: 1-40 bullet lines, max 240 chars each. Nest with 2 spaces, one level deeper at most. Facts only, drop test-count noise.
