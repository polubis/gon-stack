---
ticket: VYB-293
scope: parka/data-export
summary: Align data-export and reports modules to project rules
why: Task asked two parka modules fully aligned with rules via rules-audit agent (doctor, no reviewer agent exists).
date: 2026-11-13
---

- Audited data-export and reports with doctor agent against .claude/rules
- data-export: view-enter animation, empty state, unique partial e2e ids for format radios, private dateLabel
- reports: view-enter animation, shared set-report-data action replaces duplicated atom writes
- Left out: reports empty state (summary grid of zeros), skeleton for static data-export page
- Checks: lint, vitest 14 tests, audit pass; check-types errors are only missing built vibe-test in e2e specs
