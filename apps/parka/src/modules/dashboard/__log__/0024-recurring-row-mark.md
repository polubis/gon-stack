# 0024 - subtle recurring mark in expense rows

```json
{
  "status": "done"
}
```

- `RecurringMark`: repeat glyph on avatar corner, sr-only "Cykliczny"
- `month-expenses`: pill beside merchant removed; popup keeps `RecurringBadge`
- Desktop category pill removed; hover/focus tooltip left of amount (`role="tooltip"`), sr-only category in date line

Pill repeated per row, cost width, clashed with category pill.
