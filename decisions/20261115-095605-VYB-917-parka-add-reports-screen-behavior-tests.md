---
ticket: VYB-917
scope: parka/reports
summary: Add reports screen tests for summary, downloads and retry
why: The reports screen test covered only load, disabled buttons and one failure; summary counts, downloads and recovery were uncovered.
date: 2026-11-15
tags: [parka, reports, testing]
---

- Gap found: existing tests left summary counts, both downloads and error retry unchecked
- New reports-downloads.test.tsx drives the real screen with msw, no fetch stubs, accessible selectors only
- Summary: total and category count use this month only, recurring counts active ones
- CSV and full report downloads: file name, header row, this month rows, old month excluded
- Load failure: tech code and message shown, downloads disabled, retry recovers
- Left out: refresh via data changes and repository alone, covered through the screen
- Only module reports touched, open PR modules avoided
