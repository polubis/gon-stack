---
version: 1.0.0
name: Turborepo Tricks
cdate: 15.06.2026
mdate: 15.06.2026
tags: pnpm,turborepo,workspace,monorepo
---

## Install Same Dependency Across All Workspace Packages

```bash
# Add package to all packages at once:
# `-r` = recursive. Hits all apps/* and packages/*.
pnpm add -D <package>@<version> -r
```
