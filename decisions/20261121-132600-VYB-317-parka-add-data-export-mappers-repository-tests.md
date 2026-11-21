---
ticket: VYB-317
scope: parka
summary: Add data-export mappers and repository tests
why: Data-export had only flow, download and selectors tests. Mapping and fetch error paths were uncovered.
date: 2026-11-21
tags: [testing, data-export]
---

- mappers test: expenses and categories keep only export fields, null category stays null
- repository test via msw: list success and server-message failure for expenses and categories
- no production code changed
