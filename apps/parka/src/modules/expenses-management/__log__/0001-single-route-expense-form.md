# 0001 - one route for adding expenses, popup removed

```json
{
  "status": "done"
}
```

New module `expenses-management`, route `/app/expenses/new/` (`?type=recurring` opens the second tab). Both dashboard "Dodaj wydatek" buttons now link there.

- Type nav on top (Normalny / Cykliczny), upload + camera buttons pick a photo and scan it at once (no crop step), products can be added/removed, amount sums products.
- Removed: dashboard `NewExpense` popup, cropper, scan feedback, create expense/recurring handlers; whole `receipt` module (fake scanner); `react-image-crop` dep.
- Dashboard `RecurringForm` is edit-only now.
- Tests: module flow tests (msw), domain tests; e2e specs moved to the new route (45 pass, real-backend project not run: needs Supabase).

Decision: save waits for the backend, then navigates to the dashboard of the expense month. Optimistic UI can't span two routes without a shared store.

Open decision: the dashboard edit popup still allows changing the amount of an expense that has products, so amount and product sum can diverge. Accepted for now (existing behavior). Options when revisited: make amount read-only when products exist, or edit on this route with the full form.
