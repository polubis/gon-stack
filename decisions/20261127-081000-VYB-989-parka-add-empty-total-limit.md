---
ticket: VYB-989
scope: parka/dashboard
summary: Missing monthly limit is a proper empty state with an action
why: Limits card showed a bare grey line when only category limits existed, breaking the empty-state pattern and giving no way forward.
date: 2026-11-27
---

- Cause: `TotalLimit` rendered plain text "Brak zdefiniowanego limitu." with no icon, description or action.
- Fix: card `EmptyState` (icon, title, description, "Ustaw limit miesięczny") opening the new-limit modal.
- New e2e id `dashboard:limit-total-set`, kept apart from the whole-card empty action id.
- Tests: unit (action opens new-limit dialog), e2e on dashboard with category limit only; video across 8 viewports.
