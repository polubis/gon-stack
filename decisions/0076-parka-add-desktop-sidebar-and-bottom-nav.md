---
ticket: none
scope: parka/navigation
summary: Desktop sidebar + sticky bottom nav
why: Bottom nav was not sticky (wrapper had the nav height); desktop needs a sidebar per the new design
date: 2026-10-02
---

- `app-layout.astro`: left sticky sidebar (`lg+`), content column beside it, bottom nav wrapper `sticky bottom-0` (`lg:hidden`)
- `NavKey` += `limits`, `recurring`; `NAV_ITEMS` gets `mobile` flag
- New `SidebarNav` (logo + Start, Limity i budżet, Cykliczne, Więcej); `TopNav` removed
- `AppNav`: only `mobile` items; limits/recurring highlight "Więcej"
- `SyncedAppNav` placement `top` -> `side`
- Desktop layout follows `docs/designs/desktop/desktop-5.png`; Wydatki/Statystyki skipped (merged into dashboard).
