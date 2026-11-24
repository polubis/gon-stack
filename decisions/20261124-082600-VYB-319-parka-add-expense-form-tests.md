---
ticket: VYB-319
scope: parka
summary: Add expense-form domain tests for products and format
why: Daily test routine. shared/expense-form covered only productsTotal; category, draft and money rules had no tests.
date: 2026-11-24
tags: [testing]
---

- picked shared/expense-form, one of the oldest test touches in parka (2026-10-10), shared/keyboard is an empty untracked dir
- products-rules tests, new product defaults and unique ids, patch, shared category, default and fallback category, scanned draft mapping
- format tests, money pl-PL output, toTimestamp empty, local to UTC, original kept on same minute
- no production code changed
