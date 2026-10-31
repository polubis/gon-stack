---
ticket: VYB-202
scope: parka/transitions
summary: Add create, update, delete transition effects to parka lists
why: Users could not see what changed after a CUD action; rows jumped or popped in silently
date: 2026-10-31
tags: [ux, animation, rules]
---

- New `ux-change-transitions` rule in `.nitpick/config.ts` (generates `.claude/rules/ux.md`, rule 16)
- `shared/ui/list-changes`: `useListChanges` diffs a list and tags rows `in`, `flash`, `out`; `changeProps` gives classes and inert/aria-hidden for leaving rows
  - Deleted rows stay 300ms as ghosts, collapse height so neighbours glide up
  - `scope` arg resets baseline (period, filter, loading) so view switches never animate
  - No matchMedia or reduced motion: rows change instantly
- Keyframes `row-in`, `row-flash`, `row-out` in `index.css`, tokens only, paired with `motion-reduce:animate-none`
- Applied to day view, week cards, backlog, dashboard expenses (also dialog), categories dialog
  - Week hour grid (2xl) and access tokens list not covered
