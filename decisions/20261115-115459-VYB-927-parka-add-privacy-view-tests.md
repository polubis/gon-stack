---
ticket: VYB-927
scope: parka/privacy
summary: Add privacy view behavior and accessibility tests
why: The privacy module had two shallow tests; links, promise list and heading outline were not covered.
date: 2026-11-15
tags: [parka, privacy, testing]
---

- Privacy view had only heading and data-export link covered
- Added promise list order, policy link, back to settings links
- Added heading outline, single main landmark, decorative icons hidden
- No msw: module makes no HTTP calls
- Error boundary fallback skipped: no way to force a render error without mocks
- Only tests added, no production code changed
