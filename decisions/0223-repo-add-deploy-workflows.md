---
ticket: none
scope: repo
summary: Add deploy workflows for polubinski-dev and kdebek
why: Automate Cloudflare Worker deploys on app changes, same as parka
date: 2026-10-23
tags: [ci, deploy, cloudflare]
---

- `.github/workflows/deploy-polubinski-dev.yml`, `deploy-kdebek.yml`: copy of `deploy-parka.yml` without DB steps
  - Trigger: push to main on app path, `packages/**`, root configs, own workflow
  - Jobs: verify (format, lint, types, tests) then deploy via turbo
  - Secrets: `<APP>_CLOUDFLARE_API_TOKEN`, `<APP>_CLOUDFLARE_ACCOUNT_ID`
