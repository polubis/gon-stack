## Git

1. (A) Follow this conventional commit convention:
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
2. (A) No AI credits, refs, footer in commit message. Only title + description as nested list
3. (A) Never commit artifacts: videos, screenshots, recordings, logs, build/test output, scratch files
