---
ticket: VYB-1053
scope: parka/time
summary: Scroll to created or updated task and expense row
why: After an edit the row can move off screen, so the list now brings it into view.
date: 2026-11-25
---

- `scrollToChanged` ref callback in `shared/ui/list-changes.ts`, once per `in`/`flash` phase, `scrollIntoView` center, smooth
- Wired to task rows and expense rows (card and modal list)
- Under reduced motion phases are off, so no scroll there (known limit)
- Tests: list-changes scroll cases (create, update once, first render still)
