---
ticket: VYB-315
scope: parka/shared
summary: Cover shared error, i18n, image type and receipt handoff utils
why: Four small shared helpers had no tests though uploads and category labels depend on them.
date: 2026-11-16
---

- Picked shared utils with zero tests: `errorMessage`, `categoryLabel`, `detectImageType`, `stashReceipt/takeReceipt`
  - Skipped VYB-914..927 modules, VYB-312, VYB-313, VYB-314 areas (open PRs)
- Black box unit tests on public functions, no HTTP so no msw
  - Signature tests: all four image types, RIFF non webp, truncated, empty
  - Handoff: roundtrip, take once, storage full returns false, corrupted stash returns null
- Left for next runs: `src/core/app-router`, `dictation`, `cookies`, `theme`, `router` gaps
