## Git

1. (A) Follow this conventional commit convention:
```md
<!-- First option (no breaking change) -->
fix(repo): prevent racing of requests

- Introduce a request id and a reference to latest request
  - Nested list...
- Other points

Reviewed-by: Z
Refs: #123
<!-- Second option (when breaking change) -->
fix(repo)!: prevent racing of requests

- Introduce a request id and a reference to latest request
  - Nested list...
- Other points

Reviewed-by: Z
Refs: #123
```

2. (A) One decision/task/work means one commit. Never splitted accross many
