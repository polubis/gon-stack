---
ticket: VYB-915
scope: parka/categories
summary: Add behavior tests for categories list, dialog and delete confirm
why: The categories list screen, list dialog and delete confirmation had no tests; only the flow, pickers and mappers were covered.
date: 2026-11-15
tags: [parka, categories, testing]
---

- Picked categories: main screen, list dialog and delete dialog were uncovered
- main: empty state, only missing defaults suggested, add-all posts them, suggestions hidden when all exist
- list dialog: links to editors, empty state, load error with code and working retry, add stacks form modal in URL
- delete dialog: names the category, confirm deletes, cancel and Escape keep it
- HTTP mocked with msw, selectors by role and name
- Skipped icon-picker and pickers tests: PR 107 changes them
- Editor form skipped: needs router state, covered by e2e
- Only tests added, no production code changed
