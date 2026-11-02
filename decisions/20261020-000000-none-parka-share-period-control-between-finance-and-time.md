---
ticket: none
scope: parka
summary: Finance and tasks share one period control with numeric dates and Dziś
why: Both modules must look and behave the same; finance lacked a way back to the present
date: 2026-10-20
tags: [parka, finance, time, period-control, shared]
---

- New shared module `shared/period-control` (configuration, domain/format, presentation)
  - `PeriodControl`: arrows, period value with picker, kind list (Dzień, Tydzień, Miesiąc, Rok, Własny) and new "Dziś" action
  - Numeric labels only: `20.10.2026`, `19.10.2026 – 25.10.2026`, `10.2026`, `2026`
  - `allowFuture` option: finance off (forward disabled, pickers stop at the present), tasks on
  - Own scope stays in the consumer (finance: URL query period, tasks: route kind plus anchor)
  - `renderRange` slot adds "Własny" and the range popup; only finance passes it (tasks have no custom range view)
- Finance: old `period-control` and its picker helpers removed; range popup kept in dashboard
- Tasks: inline range control replaced; "Dziś" keeps the viewed kind, kind switch opens the current period of that kind
- E2e ids moved to `period-control:*`; tests updated, new tests for "Dziś" and labels
