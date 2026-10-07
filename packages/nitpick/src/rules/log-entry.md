Each session ends with an entry in `__log__`. Template `templates/task-log.md`.

The commit must add (stage) a new file under a `__log__/` directory:

- Path `<...>/__log__/<NNNN>-<slug>.md`, `NNNN` zero-padded number, `slug` kebab-case.
- First line `# <NNNN> - <summary>`, same `NNNN` as in the file name.
- Then a json block with `"status"`: `done`, `failed` or `done-with-clarification`.
- Then a description of changes and a reason.
