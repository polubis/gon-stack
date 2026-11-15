---
ticket: VYB-916
scope: parka/expenses-management
summary: Add unit tests for expenses-management format, mappers and repository
why: The module had behavior tests only; its pure helpers, DTO mapping and backend calls were uncovered.
date: 2026-11-15
tags: [parka, expenses-management, testing]
---

- Picked expenses-management: format, ids, integration mappers and repository had no direct tests
- format and ids: zloty money, month of a day or instant, id prefixes and uniqueness
- mappers: scan category assigned or empty, rule link kept or null, expense and recurring bodies
- repository via msw: success and server-message failure for each call, tz query, missing expense gives null
- Scan upload checked by multipart content type: jsdom File does not parse in undici FormData
- Existing behavior tests kept as the upper pyramid layer
- Only tests added, no production code changed
