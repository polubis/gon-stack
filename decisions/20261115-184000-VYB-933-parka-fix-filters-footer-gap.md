---
ticket: VYB-933
scope: parka/time
summary: Remove visible gap under sticky footer in filters drawer
why: Drawer bottom padding left a strip under the sticky footer, so scrolled content showed through it.
date: 2026-11-15
tags: [parka, time, filters, ui]
---

- Drawer `pb-0`: sticky footer now sticks to the container edge, no strip below it
- Footer `mt-auto` with `pb-[max(1rem,env(safe-area-inset-bottom))]` keeps spacing and safe area, `-mb-3` dropped
- Evidence: mobile before (12px gap) and after (0px), desktop after recordings
- Tests: existing filter tests re-run, class-only change so no new behavior test
