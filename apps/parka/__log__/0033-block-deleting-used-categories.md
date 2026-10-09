# 0033 - Categories cannot be deleted while in use

```json
{
  "status": "done"
}
```

Deleting a category left expenses, receipt items, recurring expenses and limits pointing at a missing id (UI silently showed the first category instead).

Database:

- Migration `20261009090000_category_foreign_keys.sql`: composite FK `(user_id, category_id)` -> `categories (user_id, id)` `on delete restrict` on `expenses`, `receipt_items`, `recurring_expenses`, `limits` (+ supporting indexes). Total limit has null `category_id`, so MATCH SIMPLE skips it.

Server:

- New `Conflict` (409) error and `conflictOut()` contract; `fromSupabaseError` maps Postgres `23503` to it (used by `delete-category`).

Client (`categories`):

- `remove` handler (optimistic, rolled back on failure); `Usuń kategorię` button under the edit form opens a confirm dialog (`delete-dialog.tsx`, Radix); 409 gets its own toast.
- Unit tests for success, in-use and generic failure.
- Row being edited is highlighted in the list (`aria-current`, left accent bar; transparent border on other rows so nothing jumps).

Repo rules/agents:

- `.claude/rules/ux.md` 7: `(A) Delete via confirmation`.
- `.claude/agents/ux-specialist.md` modified: rule "Delete only via confirmation" and validation step "Deletes ask for confirmation" (typecheck step renumbered to 4).

Decisions:

- Delete goes through a confirm dialog (new rule `ux.md` 7: delete via confirmation). Not optional even though the FK makes a wrong delete impossible: the dialog protects unused categories, which delete for real.
- The 409 toast tells the user what to do next: move the expenses to other categories (or delete the category limits) first, then delete. A bare "cannot delete" gave no way forward.
- FK is the single source of truth, no pre-count query: atomic, no race between check and delete. Cost: no per-type counts in the message.
- Creating an expense with a non-existent category now fails (500) instead of storing an orphan; the form already blocks saving with no categories.

Verified locally against Supabase: delete of category with expense -> 409, with limit -> 409, unused -> 200 (screenshots `cat-*.png` in repo root).

Reason: stop silent data drift between categories and records that reference them.
