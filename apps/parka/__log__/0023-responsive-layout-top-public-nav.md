# 0023 - responsive layouts, desktop top nav, public nav

```json
{
  "status": "done"
}
```

- Breakpoint `1440` added to `.claude/rules/ui.md` (aligns with Tailwind `2xl` usage in views).
- `app-layout.astro`: drop phone-only `max-w-md` shell; `max-w-7xl` content column; sticky persisted `SyncedAppNav` `placement="top"` on `lg+`, bottom tab bar unchanged below `lg`.
- `main-layout.astro`: public/marketing shell uses `PublicNav` and wider responsive padding (`max-w-7xl`, flex column).
- `shared/navigation/app-nav`: `TopNav` for desktop; `AppNav` hidden from `lg` (`lg:hidden`); `SyncedAppNav` switches on `placement`.
- New `shared/navigation/public-nav` (`PublicNav`, `e2e-ids`, barrel export); wired into home/sign-in/sign-up and related public views.
- All signed-in module `presentation/*` views updated for mobile-first RWD (spacing, grids, max-width, skeletons) across dashboard, expenses, limits, receipt, statistics, settings, etc.
- `privacy-policy.astro` and privacy module presentation aligned with wider readable column.
- `walkthrough` presentation tweaks for layout parity; global `selectors.d.ts` includes `PublicNavE2eId`.
- Module `AGENTS.md` hashes re-stamped via hashy after presentation edits.

Why: Parka should usable on tablet/desktop without a fixed narrow phone frame; primary nav belongs in a top bar on large viewports while keeping bottom tabs on small screens.
