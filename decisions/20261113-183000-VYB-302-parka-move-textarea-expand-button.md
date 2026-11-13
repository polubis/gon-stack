---
ticket: VYB-302
scope: parka/ui
summary: Textarea expand button moves inside field under mic and x
why: Expand icon sat below the field, away from the other adornments, so it looked detached and inconsistent.
date: 2026-11-13
tags: [parka, ui, textarea]
---

- `ClearableTextarea` gets optional `onExpand`, `expandLabel`, `expandE2e`, rendering a `Maximize2` button at top-right under mic and "x"
- Slot is fixed (`top-10 right-2`), so it does not jump when "x" appears with a value
- `DescriptionField` (only textarea with fullscreen mode) uses it, old button under the field removed
- Unit tests: button absent without handler, handler called with empty value
- Proof: `.evidences/task-e033f9e0/` empty and filled screenshots (not committed)
