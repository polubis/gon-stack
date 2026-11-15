---
ticket: VYB-924
scope: parka/ai-info
summary: Add ai-info module tests for steps, a11y and error fallback
why: The ai-info module had only two smoke tests; step list, intro, icon a11y and the crash fallback were uncovered.
date: 2026-11-15
tags: [parka, ai-info, testing]
---

- Picked ai-info: static view, no fetch, so msw not needed
- Page test: intro, four steps with title and description, icons hidden from assistive tech
- Error test: ScreenHeader forced to throw, fallback shows title, code and message, retry recovers the view
- Roles and text selectors only, no e2e ids
- Only tests added, no production code changed
