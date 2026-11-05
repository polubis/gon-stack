---
ticket: VYB-215
scope: parka/theme
summary: Add auto theme mode that follows the local time of day
why: Theme was manual only; auto switches dark at night without user action
date: 2026-11-05
---

- Theme mode is `light`, `dark` or `auto`, stored in `parka:theme` (legacy `dark`/`light` values still read)
- Auto is dark from 19:00 to 07:00 local time; re-checked every minute while on
- Settings: one tab control `Auto` / `Ciemny` / `Jasny` (`Segmented`, keyboard arrows supported)
  - Each tab has an icon: `SunMoon`, `Moon`, `Sun` (lucide), `aria-hidden`
  - `Segmented` option label widened from `string` to `ReactNode`
- Inline script in `seo.astro` applies auto before paint, mirroring the same hours
- Country is not stored in Parka: window uses the browser's local time, not sunrise/sunset per country
- Hook renamed `useDarkTheme` -> `useThemeMode`
- E2e `auto-theme.spec.ts` covers icons on each tab, Ciemny/Jasny forcing the theme, Auto light at 12:00 and dark at 19:00, manual Jasny at night
