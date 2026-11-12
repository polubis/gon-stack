---
ticket: VYB-247
scope: repo
summary: Add slop-fighters app as 1:1 copy of kdebek
why: Task asks for a one-to-one boilerplate of kdebek to start the slop-fighters app from
date: 2026-11-12
---

- `apps/slop-fighters` is the git-tracked kdebek tree; only identifiers renamed (package, wrangler name, README, cookie storage key and its copy mentions).
- Playwright port 4327, since 4322 belongs to kdebek.
- Visual baselines regenerated as linux only; win32 images dropped (cannot be generated here, VYB-243 plans linux only).
- No deploy workflow added: needs Cloudflare secrets. Site url and page copy still kdebek content, as asked 1:1.
- Checked lint, types, unit tests, build and e2e (64 passed, stable on rerun).
