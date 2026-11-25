---
ticket: VYB-1039
scope: parka/reports
summary: Add empty state to the report of a month without expenses
why: Report showed zero totals and enabled downloads of an empty file, breaking the empty-state UX rule.
date: 2026-11-25
tags: [reports, ux]
---

- reports: `EmptyState` (`icon:title:description:primary-action`) replaces the summary card when the month has no expenses
- action `Dodaj wydatek` links to new expense form for that month
- `Pobierz CSV` and `Pobierz pełny raport` disabled while the month is empty
- new e2e id `reports:empty`, unit test in `reports-downloads.test.tsx`, flow e2e for empty month; csv download e2e now seeds a current-month expense
