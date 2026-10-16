---
ticket: none
scope: parka
summary: Stabilize late-arriving remembered values test
why: Fixed 150 ms response delay raced with typing and failed the pre-commit hook under load
date: 2026-10-16
tags: [parka, testing, flaky]
---

- Gate suggestions response behind a test-controlled promise in `remembered-fields.test.tsx`
  - Release after typing, wait for MSW `response:mocked`, then assert
  - Drop unused `delay` import, clear MSW listeners in `afterEach`
