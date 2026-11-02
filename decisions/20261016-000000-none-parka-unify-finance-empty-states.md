---
ticket: none
scope: parka
summary: Unify finance empty states and tiles for new users
why: New-user finance view mixed plain text, dashed boxes and empty charts, breaking the UX empty-state pattern
date: 2026-10-16
tags: [parka, ux, empty-state]
---

- Extend shared `EmptyState` with primary `action` and `card` variant sized like the limits tile
- Replace ad-hoc messages in expenses, categories, spending chart, limits and categories page with `EmptyState`
  - Header actions hide while empty so each control shows once; header rows keep min height
  - Limits tile shows one combined empty state when neither total nor category limit exists
- Normalize expenses tile spacing to `space-y-4` (and skeleton); add `animate-view-enter` with `motion-reduce` to dashboard
- Drop dead empty branch from `Donut`; add new-user limits test
