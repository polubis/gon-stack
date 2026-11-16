---
ticket: VYB-854
scope: parka/expenses
summary: Overlap category names read with delete expense writes
why: Category names were read after the deletes, adding a round trip for nothing.
date: 2026-11-16
---

- Area: delete-expense procedure, backend; not covered by VYB-849/850/851/852/853, VYB-301, VYB-306
- Category name read now starts with the procedure and overlaps previous read and both deletes
- Measured with fake timers, 25 ms per round trip: 150 ms before, 125 ms after (6 trips to 5)
- Error order kept: a failed name read is raised where it was raised before, expense stays deleted
  - Cost: not-found expense now also triggers one discarded category read
- Delete order kept (items before expense, FK)
- Public response unchanged
- Not done: update-settings writes could overlap too; changes failure semantics, left for a separate task
- Test: latency and failure tests, latency red on old code, green on new; procedure suites green
