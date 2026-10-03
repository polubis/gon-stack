# 0011 - single total hero replaces 4 KPI cards

```json
{
  "status": "done"
}
```

- `kpis.tsx` -> `total-hero.tsx`: one centered card, total amount, arrow + `%` change vs previous month.
- Change hidden when rounded diff is 0.
- Bottom row of 3 small stats: `Średnio dziennie`, `Transakcje`, `Do limitu` (daily average kept in contract/server).
- Limit stat has subtle `ProgressBar` (brand/warn/danger via `limitTone`).
- Total amount neutral; only the arrow carries color (up = danger, down = brand).
- Dropped `previousTransactions`/`previousDailyAverage`; e2e ids `previous-total` removed, `change` added.

Revolut-style: one number instead of 4 cards with repeated "vs previous" lines.

## Decisions

- Limit label by state: `Do limitu` / `Blisko limitu` (>= `WARN_PCT`) / `Limit wyczerpany` / `Ponad limit` (shows overshoot as positive amount).
- Color only on the arrow, not the amount: avoids "everything is red" noise.
- Daily average kept as a small stat, no previous-month comparison.
