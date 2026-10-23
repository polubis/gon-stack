---
ticket: none
scope: repo
summary: Pin Node.js to 24.22.1
why: Security release (Brotli RCE CVE-2026-111497); 24.16.0 vulnerable
date: 2026-10-23
tags: [node, security, tooling]
---

- `.nvmrc`, root `package.json` engines (engineStrict), CI `setup-node` in `pr-ci.yml` and `deploy-parka.yml`: 24.16.0 -> 24.22.1
- No Dockerfiles, volta, .tool-versions or README pins exist
- VPS scripts read `.nvmrc`, no change
