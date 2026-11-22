---
ticket: VYB-318
scope: parka/notifications
summary: Add notifications format tests
why: Task count, unfinished summary, money and day labels had no tests while the age label did.
date: 2026-11-22
tags: [testing, notifications]
---

- format tests: Polish task plurals (1, 2-4, 5, 12, 22, 0) and unfinished summary with and without total
  - zero total stays distinct from a missing one
- money in zloty with decimal comma, plain day and ISO instant as day label
- no production code changed
