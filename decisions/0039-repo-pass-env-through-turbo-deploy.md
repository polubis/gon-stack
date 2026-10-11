---
ticket: none
scope: repo
summary: Turbo deploy passThroughEnv for Cloudflare credentials
why: Deploy needs Cloudflare credentials in CI and local deploy flows; without passthrough, Turbo can hide vars that are not listed in `globalEnv`
date: 2026-09-28
---

- Added `passThroughEnv` on the root `deploy` task in `turbo.json` so `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` reach deploy scripts when Turbo runs the task, instead of being stripped by the task runner env filter.
