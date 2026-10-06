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
