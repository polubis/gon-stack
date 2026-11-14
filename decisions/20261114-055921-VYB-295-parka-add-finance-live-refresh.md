---
ticket: VYB-295
scope: parka/data-sync
summary: Add live refresh of finance data like the time module
why: Finance changes from another device or MCP should show in open tabs without a reload.
date: 2026-11-14
---

- DB triggers on expenses, categories, recurring_expenses, limits send a private Realtime notice (domain finance) on the owner topic; write never fails on notice error
- Reuses the VYB-291 channel: one stream per tab, notice carries only the domain, tabs refetch over REST, resync after unlock
- Dashboard and reports already listened to finance; categories and expenses-management now refresh silently too
- MCP has no finance write tools (read only), so DB triggers cover other devices and any future writer
- Tests: pgTAP for the triggers, hook tests for both modules
- Bumped astro 7.3.8 to 7.4.7 (catalog + release age exclude): pre-commit audit gate failed on two astro advisories
- Pinned @emnapi/runtime to 1.11.3 by override: the bump pulled a beta that broke astro check
