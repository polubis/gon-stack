# 0001 - desktop sidebar + sticky bottom nav

```json
{
  "status": "done"
}
```

- `app-layout.astro`: left sticky sidebar (`lg+`), content column beside it, bottom nav wrapper `sticky bottom-0` (`lg:hidden`)
- `NavKey` += `limits`, `recurring`; `NAV_ITEMS` gets `mobile` flag
- New `SidebarNav` (logo + Start, Limity i budżet, Cykliczne, Więcej); `TopNav` removed
- `AppNav`: only `mobile` items; limits/recurring highlight "Więcej"
- `SyncedAppNav` placement `top` -> `side`

Bottom nav was not sticky: `transition:persist` wrapper had nav's own height, so `sticky` on nav had no scroll range. Sticky moved to wrapper. Desktop layout follows `docs/designs/desktop/desktop-5.png`; Wydatki/Statystyki skipped (merged into dashboard).
