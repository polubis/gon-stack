# 0048 - Fractional receipt item quantity

```json
{
  "status": "done"
}
```

Saving a scanned receipt with weighed items (0.289 kg) failed with 500.

- migration `20261010100000`: `receipt_items.quantity` integer -> `numeric(12, 3)`.
- verified before/after with recorded e2e video on real local Supabase.

Reason: `integer` column rejected fractional quantities (`22P02`).
