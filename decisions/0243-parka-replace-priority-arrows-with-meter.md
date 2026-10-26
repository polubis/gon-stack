---
ticket: none
scope: parka
summary: Show task priority as a 10-pip meter instead of arrow icons
why: Arrow icons were unintuitive; a pip count reads at a glance and keeps the 1-10 scale
date: 2026-10-26
tags: [ui, time, a11y]
---

- Add `PriorityMeter` (10 pips, `value` filled) and use it in `PriorityBadge` and `PriorityPicker`
  - Meter is `aria-hidden`; screen-reader text reads "Priorytet: name, value z 10"
  - No visible number, no icons; tone tokens unchanged
- Stack name under meter in picker radios to avoid truncation
