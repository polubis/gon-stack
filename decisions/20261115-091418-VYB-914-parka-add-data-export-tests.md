---
ticket: VYB-914
scope: parka/data-export
summary: Add behavior tests for the data-export module
why: Module had two test files and gaps in download, formats and mixed categories.
date: 2026-11-15
---

- Added download unit test (file name, blob type, url release, anchor cleanup)
  - Black box via public download function and stubbed URL API
- Extended selectors tests with mixed, unknown and empty cases
- Extended flow tests with msw: server error message, chosen format content, confirmation reset, default format
  - Selectors are roles and names, no e2e ids
- Repository, mappers and handler covered through the page, no internals tests
- Other modules untouched
