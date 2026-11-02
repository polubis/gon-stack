---
ticket: none
scope: parka/time
summary: Rework task priority badge and picker
why: Priority was a bare arrow in rows, so low vs medium was unclear and raw numbers confused
date: 2026-10-24
tags: [parka, ux, ui, time, accessibility]
---

- `PriorityBadge` replaces `PriorityMark`: tinted pill with lucide icon and the priority name
  - used in task rows (board and backlog), task details popup
  - high = `ChevronsUp` on danger, medium = `Equal` on warn, low = `ChevronDown` on neutral
  - level not shown by colour alone: icon and name always visible, sr-only "Priorytet:" prefix
  - medium now shown too, so it differs from "no priority"
- `PriorityPicker`: segments show icon and name only (no "5 - Średni"); selected one gets a card, ring and level tone
- `PriorityDialog`: legend "Ważność", level ranges in description, live badge preview of name and level
- Order kept ascending by value; sorting is a separate task
- Tests and e2e spec use the plain names as radio labels; vitest time 111 pass, lint and `astro check` clean
