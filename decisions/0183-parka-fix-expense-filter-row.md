---
ticket: none
scope: parka
summary: Fix expense filter row gaps and unreachable scroll on desktop
why: One category hid the chip row leaving blank space; hidden scrollbar made row unreachable by mouse
date: 2026-10-14
tags: [dashboard, ui, rwd]
---

- Cause 1: row rendered only when `tabs.length > 1`; one category left empty reserved `h-10` gap
  - "Wszystkie N" chip now always rendered, plus category chips
- Cause 2: scrollbar hidden on all viewports; mouse users could not scroll row
  - Hide only below `md` (`max-md:[scrollbar-width:none]`); native bar visible `md+`
  - `md:pb-2` gap above bar; wrapper `h-10 md:h-16` fixed, no layout jump
  - Mobile unchanged: touch scroll, no bar
- Cause 3: fixed filter wrapper `md:h-16` + `md:pb-2` left ~24px dead space; gap to "Nadchodzące" widget 42px
  - Wrapper `md:h-12`, `md:pb-1`, thin scrollbar on `md+`: gap 26px
  - Upcoming widget + list share one stable `space-y-3` wrapper; conditional widget carries no margin/padding of its own
- New rule `ui.md` #9: conditional branches must not stack padding, margin, or offset; spacing only on stable wrapper
- New rule `ux.md` #15: empty states follow `icon:title:description:primary-action`
- E2E `filter-row.spec.ts`: single category shows "Wszystkie"; desktop bar visible + last chip reachable; mobile bar hidden + last chip reachable
- Proof: before/after video, mocked backend
