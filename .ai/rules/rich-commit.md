One decision/task/work means one commit. Never splitted accross many. Follow this conventional commit convention:

```md
<!-- First option (no breaking change) -->
fix(repo): prevent racing of requests

- Introduce a request id and a reference to latest request
  - Nested list...
- Other points
<!-- Second option (when breaking change) -->
fix(repo)!: prevent racing of requests

- Introduce a request id and a reference to latest request
  - Nested list...
- Other points
```

Strict format:

- Subject `type(scope): title`, scope required, `!` before `:` for breaking change.
- Blank line, then a `- ` change list. Nested `  - ` items allowed.
- The list ends the message. Nothing after the last list item: no footer, trailer (`Key: value`), reference (`Refs`, `Fixes`, `Closes`), `Co-authored-by`, `Signed-off-by` or AI credit.
- No blank lines inside the list.
