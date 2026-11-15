---
ticket: VYB-911
scope: parka/time
summary: Audit of parka time UX, icon search without results gets empty state
why: Rule ux-15 asks for icon:title:description:primary-action empty states; icon search showed plain text with no way on.
date: 2026-11-15
tags: [parka, time, ux, audit]
---

- Audited `modules/time` (most changed module, 618 changes in 30 days) against UX/UI rules: clear "x" on text inputs, delete confirmations, motion-reduce, empty states with filters, error `role="alert"`, no raw px/colors/z-index
- Only finding: icon picker empty search was a bare `<p>` (ux rule 15)
- Fix in `time` and its copy in `categories`: `EmptyState` (card) with `SearchX`, title, description naming the phrase, action "Wyczyść wyszukiwanie" (clears phrase and group)
- Left as is: per-day "Brak zadań." line in week view (inline per-day note, not a screen empty state); statuses editor row delete (draft, saved as a whole)
- Tests: new `time/__tests__/icon-picker.test.tsx`, extended `categories/__tests__/pickers.test.tsx`; parka vitest 1477 passed, eslint and `astro check` clean
- Proof `.evidences/task-d96bdcab/` before/after webm (not committed); after video not slowed
