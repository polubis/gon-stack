---
ticket: VYB-159
scope: parka/ui
summary: Unify z-index scale and toast layering
why: Layers were ad hoc and menus shared a level with modals. One ordered scale at top of index.css; toast above modals and reachable
date: 2026-10-27
tags: [parka, ui, z-index, toast]
---

- Z-index tokens at top of `index.css`: raised < modal < popover < toast < tooltip
  - `--z-nav`, `--z-voice` folded in; all raw `z-10` and old tokens replaced app wide
  - Menus, selects, typeahead now `popover` (above modals); voice overlay and drawer screen `modal`
- Toast ignores outside-click/focus of open modals, so dismissing it no longer closes the modal
- Rules: `styling.md` items 6-8
- Tests: toast dismissed over open modal keeps modal
