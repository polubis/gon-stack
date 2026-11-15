---
ticket: VYB-922
scope: parka/finance-tour
summary: Add finance tour tests for Back, stale URL and save errors
why: The tour had one test file; Back close, stale link cleanup, empty or failed answers and error toast dismissal were uncovered.
date: 2026-11-15
tags: [parka, finance-tour, testing]
---

- Picked finance-tour: main flow already tested, edge cases were missing
- New file with msw backend, role and name selectors only, no internals
- Covered: empty state answer, network down, stale tour link removed, Enter walks steps
- Covered: Back closes and saves skipped, URL cleared after skip, error toast shows server message and closes
- Illustrations and steps data left to the walkthrough flow tests, no snapshot tests
- Only tests added, no production code changed
