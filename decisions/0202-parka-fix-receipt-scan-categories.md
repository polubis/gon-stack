---
ticket: none
scope: parka
summary: Scanned items use user categories; none saved is an error
why: Client dropped the per-item category from the scan and put every item in the first category
date: 2026-10-20
tags: [parka, receipts, categories]
---

- Root cause: `toReceiptDraft` mapper ignored server `category`; `productsFromDraft` gave all items `categories[0]`
- Mapper keeps matched category id; `productsFromDraft(items, categories)` keeps it only if the user owns it, else first own category
- `scan-receipt` procedure throws `Conflict` (409) when user has no categories, checked before the daily quota claim; `errorOut` gains 409
  - Shown via existing scan error pattern (title, `RECEIPT_SCAN`, description, retry, back)
