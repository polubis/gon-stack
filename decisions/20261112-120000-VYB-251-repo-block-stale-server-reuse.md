---
ticket: VYB-251
scope: repo
summary: vibe-test no longer reuses a server already on the port unless asked
why: A stale dev server served old code and produced misleading failures blamed on the code
date: 2026-11-12
---

- `createPlaywrightConfig` sets `reuseExistingServer` only when `VIBE_REUSE_SERVER=1`.
- Default now fails loudly with Playwright "already used" error when port is busy.
- Chose opt-in flag over hash check: simpler, no server cooperation needed.
- No unit test: vibe-test has no test runner; behavior shown with a stale server probe.
