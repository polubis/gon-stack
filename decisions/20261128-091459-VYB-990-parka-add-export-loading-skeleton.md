---
ticket: VYB-990
scope: parka/data-export
summary: Data export shows loading skeleton and swaps controls for state
why: Export page showed disabled controls while loading and pushed them down when empty or error appeared, breaking skeleton and no-jump UX rules.
date: 2026-11-28
---

- Add ExportSkeleton mirroring format cards and button, shown while initializing; it replaces the inline skeleton from VYB-1040 and keeps its accessible status label and aria-busy.
- Empty and error states replace the format picker and export button instead of stacking above disabled controls.
- Tests: flow tests assert controls hidden while loading, empty and error; recover after retry.
- Evidence: one video of loading, empty and error states at all 8 supported viewports.
