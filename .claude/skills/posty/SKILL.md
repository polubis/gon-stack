---
name: posty
description: Batch post language polisher. Reads a file (or inline content) with posts separated by "---", applies grammar/typography corrections to each post using the language-specific template (Polish or English), and returns all corrected posts separated by "---".
---

## ROLE

Orchestrator. Dispatch: pick template, split input, correct each post, route output. No preview of reference contents — read file each run.

## CONTEXT

Polish conversation/output → `references/pl_template.md`. English → `references/en_template.md`. One file for whole batch.

## STEPS

1. **Select** — infer language from conversation. Pick reference file.
2. **Read input** — file path (plain string or `@file`) or inline pasted text.
3. **Split** — divide by `---`. Trim whitespace. Discard empty segments.
4. **Correct each post** — open reference, place post in `<POST>` tag, execute rules. Language/typography only — no content rewrites.
5. **Assemble** — join corrected posts with `---` (blank line before/after separator).
6. **Route output:**
   - **(a)** no path, no save intent → reply only (default)
   - **(b)** output path named → write there
   - **(c)** edit intent + known path → overwrite

## NARROWING

- No content changes. Meaning, structure, ideas unchanged.
- No previewing reference before reading.
- Write files only for **(b)/(c)**.
