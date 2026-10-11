---
ticket: none
scope: parka
summary: Fractional receipt item quantity
why: The DB `integer` column rejected fractional quantities (`22P02`)
date: 2026-10-10
---

- Saving a scanned receipt with weighed items (0.289 kg) failed with 500.
- migration `20261010100000`: `receipt_items.quantity` integer -> `numeric(12, 3)`.
