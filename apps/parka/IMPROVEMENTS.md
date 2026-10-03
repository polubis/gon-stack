# Parka - dashboard and finance improvements

Static audit (code only, app and tests not run). Not read: `charts.tsx`, `product-card.tsx`, expenses-management `recurring-form.tsx`, reports module, `limit-form.tsx`.
Effort: S < 0.5d, M ~1d, L 2d+.

## Dashboard UI problems

- Dark mode unreachable: `index.css` defines `:root[data-theme='dark']`, nothing sets `data-theme`, no toggle, no `prefers-color-scheme`. No contrast/font-size prefs. Reduced motion only on spinners.
- Hierarchy: expenses list (main purpose) ~500px down on mobile, below chart. Hero says "this month" for past months. Hero limit duplicates Limits card. "Add expense" in header and card. Emoji in greeting. Month select has no prev/next. Avatar hidden on mobile.
- Jumping UI: skeleton does not match loaded layout (list height, chip row, hero stats). Failed month switch replaces whole page with error. Old data shown under new month header while loading.
- Nested fixed-height scroll areas (expenses list, Limits card) on mobile.
- Chart: tooltips hover-only, chart `aria-hidden` (sr-only table ok), fixed `w-14` y-axis crowded at 320, x labels stop at day 28, no empty state.
- States: error `backHref` = onboarding `/`, wrong for signed-in users. No first-run empty state/CTA. No `aria-live` on month/filter change.
- A11y: `Segmented` tablist without tabpanel/arrow keys; `Dialog.Close` is text; `Sheet` focus trap omits textarea, no focus return; toast no pause/undo.
- Breakpoints: only md/lg/xl used; 320, 480, 640, 1440, 1920 untuned; no max-width container.
- Tokens: few raw arbitrary values (`gap-[0.0625rem]`, `h-[calc(8*3.5rem+0.4375rem)]`, `strokeWidth 1.5`, `w-14`, `max-w-24`).

## Finance module gaps

- No standalone expenses list: one month inside a dashboard card, no search/date range/sort/pagination. `DashboardQuery.range` unused. `GET /api/expenses` has no frontend caller found (verify).
- Mobile nav: only Finance and More; no persistent add-expense action; reports/export/categories/notifications hidden.
- Edit: only merchant/amount/category; date, payment method, items, receipt missing; no validation (empty merchant, amount 0 saved).
- Delete: no confirm/undo; recurring delete wipes series + history.
- Recurring: monthly only; no pause/end date; edit label "first payment" edits `nextPaymentDate`.
- Receipts: `scan-receipt` returns `sampleReceiptDraft` and ignores the file, UI shows fabricated data. Photo never stored (no bucket/column). No way to view receipt later. `image/*` only, client-side validation only, no drag-drop.
- Create flow: no success toast after save; load error shown above live form; categories link loses form state; no inline category create; no unsaved guard.
- Categories: create/load/update only; no delete.
- Limits: total + per-category CRUD in Sheet; delete path unverified.

## Rule violations

- `ui.md` 2, 3: dark mode and a11y prefs not switchable (biggest). `ui.md` 4: breakpoints.
- `ux.md` 1, 2, 4, 6: back target, skeleton parity, create not optimistic/no toast, layout shifts.
- `accessibility.md` 3: chart tooltips mouse-only, `Segmented` no arrows, `Sheet` trap gaps.
- `styling.md` 1, 3: raw arbitrary values (low). `general.md` 2: emoji.
- `testing.md`: e2e covers only dashboard recalculation; none for create/receipt/recurring.
- `architecture.md`: layers ok; recurring/format/models duplicated between dashboard and expenses-management (confirm intentional).

## Prioritized fixes

### P0

1. Fake receipt scan - S to hide/label "coming soon"; L for real OCR + storage + migration + server validation. Decision needed. `server/application/procedures/scan-receipt`, `server/domain/receipt-scan`, `expenses-management/presentation/receipt-upload.tsx`.
2. Switchable dark mode + a11y prefs - M. `core/layouts/main-layout.astro`, `core/app-router/shell.tsx`, `modules/settings/presentation/main.tsx`.
3. Fix back target - S. `dashboard/presentation/main.tsx`, `expenses-management/presentation/main.tsx`.
4. Confirm/undo for destructive actions - M. `expense-detail.tsx`, `dashboard/presentation/recurring-form.tsx`.
5. Validate expense edit - S. `expense-detail.tsx`.

### P1

6. Expenses list page `/app/expenses/` (search, category, date range, sort, pagination, wire `range`) - L. `routes.ts`, `pages.ts`, `router.ts`, nav, `GET /api/expenses`.
7. Mobile add-expense FAB/center tab + discoverable reports/export - S-M. `shared/navigation/app-nav/presentation/app-nav.tsx`.
8. Skeleton parity + inline error banner on failed month switch - S.
9. Post-create success toast - S. `expenses-management` main.
10. Category delete with reassign rule - M. `modules/categories` + server procedure.
11. Full expense edit (date, method, items, receipt view) - M, depends on 1.
12. First-run empty state with CTA - S. `total-hero.tsx`, `month-expenses.tsx`.
13. Inline category create in new-expense form - M.
14. Fix recurring date label; add pause/end date/frequency - S + M.

### P2

15. Dashboard hierarchy: list before chart on mobile, merge hero limit with Limits card, month-aware hero label, prev/next month - M.
16. Chart touch/keyboard tooltips, last-day label, 320/480 check - M.
17. Missing breakpoints + max-width container - M.
18. "Show more" instead of nested fixed-height scroll on mobile - M.
19. A11y: `Segmented` arrows, `Sheet` textarea + focus return, icon close button, `aria-live` - S each.
20. Remove raw arbitrary values and emoji - S.
21. E2E for create, recurring, edit, delete, receipt error - M.

Suggested order: 3, 5, 1 (decision), 4, 2, 9, 8, 7, 12, 14, then 6, 10, 11, 13, then P2.
