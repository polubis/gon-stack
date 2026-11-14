---
ticket: VYB-310
scope: parka/reports
summary: Add unit tests for reports format, mappers and download
why: The reports module had tests only for selectors and the flow; its pure helpers and DTO mapping were uncovered.
date: 2026-11-14
tags: [parka, reports, testing]
---

- Picked reports: format, integration mappers and download helper had no direct tests
- format: month validation (bad shapes throw), Polish money, month and date labels, current month
- mappers: expense category set de-duplicated and empty when uncategorised, category and recurring keep only used fields
- download: blob type and content, file name, link removed and object URL revoked
- Money test uses 5-digit amount: pl-PL does not group 4-digit numbers
- Only tests added, no production code changed
