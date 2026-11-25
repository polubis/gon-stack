---
ticket: VYB-987
scope: parka/dashboard
summary: Missing monthly limit shows a proper empty state
why: UX rule 16 needs icon, title, description and primary action, but the card showed one plain line.
date: 2026-11-25
---

- Limits card: total limit missing while category limits exist now renders shared EmptyState
  - icon Gauge, title "Brak limitu miesięcznego", description, action "Ustaw limit miesięczny"
  - action opens the new-limit modal stacked via URL, same as the full empty card
- Test added in limits-card.test.tsx, load-wait helper made optional
- Evidence: one webm sweeping 320-1920 px viewports plus the opened modal at 390 px
