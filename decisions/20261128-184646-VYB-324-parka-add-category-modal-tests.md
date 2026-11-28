---
ticket: VYB-324
scope: parka/categories
summary: Cover new category dialog with behavior tests
why: New category popup had no tests for validation, duplicates, create payload, cancel and save failure.
date: 2026-11-28
---

- Gap found: picker, list and flow tests exist, CategoryModals new-category form had none
- Added category-modals.test.tsx with msw backend, accessible selectors, URL modal stack
- Cases: empty name, duplicate name (trimmed), create with picked color, cancel, failed save error
- Toast on success skipped, already covered by categories-flow test
