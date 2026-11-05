---
ticket: none
scope: repo
summary: Add Linux visual baselines for kdebek e2e next to win32 ones
why: Visual specs fail on any Linux box because only chromium-win32 baselines existed; text wraps differently per OS so one set cannot serve both
date: 2026-11-05
---

- 16 `*-chromium-linux.png` baselines for kdebek: home, privacy-policy, cookies banner and preferences, 4 viewports each
- `win32` baselines unchanged, Playwright picks the file by platform
- Generated in fresh Debian 13 built by `vps-gon-stack` (fonts from Playwright `install-deps`) with `test:e2e:update-snapshots`
  - Before: 16 visual tests failed on missing baseline, 48 passed; after: 64 passed, stable on 2 more runs
- Mobile and tablet pages differ from win32 in height (3 to 69 px): text wraps differently, so a shared baseline is not possible
- PR CI does not run e2e, so Linux e2e was never checked before
- UI change in kdebek now needs baseline update on both Windows and Linux
