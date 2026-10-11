---
ticket: none
scope: parka/dashboard
summary: Single total hero replaces 4 KPI cards
why: "Revolut-style: one number instead of 4 cards with repeated \"vs previous\" lines"
date: 2026-10-03
---

- `kpis.tsx` -> `total-hero.tsx`: one centered card, total amount, arrow + `%` change vs previous month.
- Change hidden when rounded diff is 0.
- Bottom row of 3 small stats: `Średnio dziennie`, `Transakcje`, `Do limitu` (daily average kept in contract/server).
- Limit stat has subtle `ProgressBar` (brand/warn/danger via `limitTone`).
- Total amount neutral; only the arrow carries color (up = danger, down = brand).
- Dropped `previousTransactions`/`previousDailyAverage`; e2e ids `previous-total` removed, `change` added.
- Limit label by state: `Do limitu` / `Blisko limitu` (>= `WARN_PCT`) / `Limit wyczerpany` / `Ponad limit` (shows overshoot as positive amount).
- Color only on the arrow, not the amount: avoids "everything is red" noise.
- Daily average kept as a small stat, no previous-month comparison.
