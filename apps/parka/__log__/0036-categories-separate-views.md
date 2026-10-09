# 0036 - Categories: list, add and edit/delete on separate views

```json
{
  "status": "done"
}
```

Single form next to the list mixed add/edit, hid which category was edited, and offered few hard-to-find icons.

Routes (`APP_ROUTER`, `pages.ts`, `router.ts`):

- `/app/categories/` list, `/app/categories/new/` add, `/app/categories/edit/?id=<id>` edit + delete. Id is a query param (prerendered static pages).
- Layout route `categories-layout` (`presentation/shell.tsx`) owns the Provider, load, loading banner, toast, so optimistic updates and toasts survive list <-> editor navigation.

Client (`categories`):

- `main.tsx` = list only: `Dodaj` header button, rows are links to edit, suggested categories kept.
- `editor.tsx` = one form for add/edit, titled `Nowa kategoria` / `Edytuj: <name>`, live preview, name validation (empty, duplicate), delete with existing confirm dialog (edit only), not-found state.
- `icon-picker.tsx`: search (Polish, diacritics-insensitive), group chips, labelled tooltips. `color-picker.tsx`: labelled `Własny kolor`.
- 94 icons (+45), Polish labels/groups in `configuration/icon-catalog.ts` (`Record<CategoryIconId, ...>` keeps it exhaustive).
- Removed `category-form.tsx`, `Editing` type, `NEW_CATEGORY_NAME` (empty name no longer silently saved as "Nowa kategoria").

Tests: e2e flows for add (with validation + icon search), edit, delete on own page; all 47 chromium e2e + 232 unit green.

Decisions:

- Edit/delete on a separate view (asked), add on `/new/` using the same editor so both look identical.
- Id in query, not path: pages are prerendered, dynamic path segment would need SSR fallback.

Reason: make category management intuitive and obvious about what is being edited.
