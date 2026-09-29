---
version: 1.4
hash: 125c69c46ae421988cc009f8b8c6098075a23f8fa899c9fe0ead824cc0e277f1
name: receipt
description: Receipt entry module (scan/manual draft, review, save). Use for create flows writing two entities.
---


# Receipt

Isolated module. Loads `/api/categories` on mount, user builds a draft (scan is a fake 600 ms delay, or manual), save POSTs an expense and a `receipt-confirmation` notification, then navigates to `APP_ROUTER.expenses()`. Imports nothing from other modules.

## Architecture

1. "configuration" — `FEATURE_NAME`, `ERROR_CODES`, `UNCATEGORIZED`, `NO_CATEGORY`, defaults, e2e ids.
2. "domain" — `models` (branded ids, `Draft`, `NewReceipt`), `events`, `format` (money), `receipt` (pure draft ops: add/patch item, `toReceipt` with client ids `exp-`/`ri-`/`ntf-`; no configuration import, item name, total, payment method and notification body are passed in).
3. "core" — `store` (`$categories`, `$saving`, `$saved`, `$notice`, ...), `handlers/{load,save,dismiss-notice}`, `actions/notify`, `registry`, `facade`, `mediator`.
4. "integration" — `repository` (only fetch: GET categories, POST expense + notification), `mappers` (DTO <-> domain).
5. "presentation" — `context`, `main` (step state, `ErrorBoundary`), `scan-step`, `review-step`, `item-card`, `scan-skeleton`, `selectors` (view selectors: item/draft total, `canSave`, category resolve/default).
6. "index.ts" — exports `Main` only.

## Code

1. `const` + arrows, named exports, `type` only, factory `createX`.
2. Events `[TRIGGER]_{LOAD,SAVE,DISMISS_NOTICE}`; `save` uses `exhaustMap` (no duplicate submits).
3. Draft = view state (`Step` union in `main`); pure ops in `domain/receipt.ts` (args, not constants), view selectors in `presentation/selectors.ts`.
4. Save: no optimistic entity (page navigates away); `$saving` -> button spinner; success -> `$saved` -> navigate; failure -> error `Toast`, draft kept.
5. First load `Skeleton`; reload `LoadingBanner`; load error `ErrorState` (`RECEIPT_LOAD`).
6. `Main` = content only; page shell in `pages/app/receipt-scan.astro`.
7. Tokens + `cn` only; no raw px/colors (category colors from data).

## References

- [domain/receipt.ts](./domain/receipt.ts) — draft rules.
- [core/handlers/save.ts](./core/handlers/save.ts) — save flow.
- [integration/repository.ts](./integration/repository.ts) — fetch boundary.
- [presentation/main.tsx](./presentation/main.tsx) — step wiring.

> Read a reference only when the rule above is unclear.
