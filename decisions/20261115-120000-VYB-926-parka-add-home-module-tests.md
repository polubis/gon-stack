---
ticket: VYB-926
scope: parka/home
summary: Add home landing tests for highlights and a11y tree
why: Landing covered only heading and links; highlights list, tagline and sample-hidden contract had no test.
date: 2026-11-15
tags: [parka, tests, home]
---

- Added 4 unit tests in `home.test.tsx`, role-based selectors, no mocks
  - Highlights list shows all three features in order
  - Tagline text, no error alert on healthy render
  - Only the real list and 2 links in the accessibility tree, sample is `aria-hidden`
- Pyramid: unit for static content, existing e2e (`screens`, `flows`) keep route and sign-up click
- No msw: module has no HTTP
- Limit: error boundary fallback untested, nothing in the module can throw without mocking internals
