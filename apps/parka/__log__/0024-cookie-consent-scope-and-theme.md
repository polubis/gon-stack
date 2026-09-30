# 0024 - cookie consent only on home/auth pages, themed bottom banner

```json
{
  "status": "done"
}
```

- `core/layouts/seo.astro`: `CookieConsent` mounted only when `url` is home, sign-in or sign-up (`COOKIE_CONSENT_PAGES`); `/app/*` and privacy policy no longer render it.
- `shared/cookies/presentation` (`banner`, `preferences-dialog`, `saved-toast`, `reopen-trigger`): hardcoded slate/orange/emerald/white classes replaced with theme tokens (`bg-card`, `border-line`, `text-ink`, `bg-brand`, `text-on-brand`, `bg-overlay`, `shadow-card`, `z-(--z-modal)`); follows light/dark theme.
- `banner.tsx`: bottom of screen, horizontally centered, no overlay (`bottom-4 left-1/2 -translate-x-1/2`, `max-w-md`, `sm:max-w-2xl`).
- Actions stacked (`flex-col`) below `sm`, one equal-width row from `sm`; order manage / reject / accept; policy link above actions; `order-*` hacks removed.
- Banner emphasis: `border-line-strong` + new token `--shadow-popover` (light + dark) in `core/style/index.css`.
- e2e `flows.spec.ts`: onboarding flow accepts cookies first (banner now covers walkthrough CTA at bottom).
- Side effect: reopen-preferences button hidden on pages without banner.
- Screenshots for 320, 480, 640, 768, 1024, 1280, 1440, 1920 in `docs/cookie-banner/`; button layout measured per width. `astro check` 0 errors; e2e not run.

Why: banner clashed with app design, showed on every page, and needed consistent bottom placement and button layout.
