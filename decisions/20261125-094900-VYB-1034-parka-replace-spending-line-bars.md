---
ticket: VYB-1034
scope: parka/dashboard
summary: Spending chart draws two grouped bars per bucket
why: Time module bar chart has no line overlay, finance chart should look the same with current and previous bars.
date: 2026-11-25
tags: [dashboard, chart]
---

- replace dashed previous-period line with a second bar beside the current bar
- each bucket is focusable with aria-label and tooltip showing both values
- drop sr-only table, bar labels carry the same data
- legend swatch for previous period is now a muted dot
