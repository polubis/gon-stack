---
ticket: VYB-1065
scope: parka/app-update
summary: Update notice stays clickable and accessible over an open modal
why: Radix modal locks body pointer events and hides siblings, so the X on the update notice froze the app.
date: 2026-11-26
---

- Cause: notice rendered inside app root, so open Radix modal set pointer-events none and aria-hidden on it; X click became outside click.
- Fix: portal notice into body-level host with aria-live (skipped by aria-hidden) and pointer-events auto.
- Notice stops pointerdown and focus propagation, like the error toast, so the modal below is never closed or refocused.
- Tests: unit with Radix dialog under the notice, e2e on dashboard with a stacked modal; e2e failed before the fix.
