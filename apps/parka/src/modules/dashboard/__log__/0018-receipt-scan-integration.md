# 0018 - receipt photo/upload wired into add-expense popup

```json
{
  "status": "done"
}
```

"Nowy wydatek" popup has three options on top: `Wgraj z pliku`, `Zrób zdjęcie`, `Dodaj ręcznie` (default, old form).

- Pick via native `<input type=file accept=image/* [capture=environment]>`; client check: image, <=10 MB.
- `react-image-crop@11.1.2` (ISC, no deps): preview + draggable frame; no frame = whole photo; crop via canvas -> JPEG.
- `POST /api/receipts/scan/` (multipart, `@schemas/receipts`, private procedure): validates image + 10 MB, returns fixed sample draft (Biedronka, 42,50). No recognition yet.
- Draft prefills the expense form (`source: receipt`, items get fresh ids + chosen category). Skeleton while scanning; error `RECEIPT_SCAN` with retry/back.
- `facade.scanReceipt` is a one-shot call (draft goes to the form, not the store).
- Tests: contract, multipart via `astroAdapter`, popup flow (msw), e2e in `dashboard-recalculation`.
- Untouched: header "Dodaj wydatek" still links to `/app/receipt-scan/` (separate receipt module).
