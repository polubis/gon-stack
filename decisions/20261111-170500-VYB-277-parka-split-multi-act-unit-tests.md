---
ticket: VYB-277
scope: parka
summary: Unit tests keep arrange, act, assert in order
why: Testing rule 2 asks for Arrange Act Assert; tests that asserted between acts hid which step broke
date: 2026-11-11
---

- Audited all 134 parka unit test files for assertions placed between acts.
- Tests with several act and assert rounds were split into one test per behavior, sharing arrange via small local helpers.
- Pure-function tables became `it.each`; guard assertions before the act became waits or own tests.
- Selectors stay accessible, no e2e ids in unit tests; covered behaviors unchanged (1386 tests green).
