# TODO

Follow-ups from the PageSpeed Insights performance audit (mobile, 2026-07-25).
Image sizing, font preload mismatch, and the oversized footer SVG are already fixed.
Remaining items below.

## Performance

- [x] **Stop hydrating the whole page as one `client:load` island.**
      Fixed: static sections (`Hero`, `Testimonials`, `ServicesGrid`, `BookingWidget`,
      `OpeningHours`, `OnlineBookingCta`, `Footer`) now render as plain SSR markup with
      zero client JS. `About`/`Offer`/`OfferPanel` were rewritten as `.astro` components
      so only the genuinely interactive pieces ship JS: `Navbar` (`client:load`,
      above the fold) and `AboutGallery`/`Counter`/`OfferWidget` (`client:visible`,
      below the fold). See `modules/home/presentation/home.astro`.
      `pages/index.astro` mounts `Main` (`modules/home/presentation/main.tsx`) — which
      renders Navbar + Hero + Testimonials + About + Offer + OnlineBookingCta + Footer —
      as a single eager React tree. This is the main driver of LCP being 4.2s (poor):
      it forces ~83KB of React/ReactDOM/jsx-runtime/Astro-renderer JS onto the critical
      path competing with the hero image for bandwidth, and produces the "Reduce unused
      JavaScript" finding (42% of the 56KB Astro client runtime chunk unused).

  Audited which components actually need client JS (grepped for hooks/handlers):
  - Genuinely interactive: `Navbar` (mobile menu `useState` + scroll handlers, above
    the fold), `AboutGallery` (carousel `useState`/`useEffect`, below fold),
    `Counter` (×7 in About stats, `IntersectionObserver` count-up, below fold),
    `OfferWidget` (private/company tab `useState`, below fold).
  - Everything else has zero hooks/handlers — purely static markup: Hero shell,
    `ServicesGrid`, `Testimonials`, `BookingWidget` (just a styled link),
    `OfferPanel`, `OpeningHours`, `OnlineBookingCta` (decorative mockups only),
    `Footer`, `LogoMark`, `GreenOnLogo`, `social-icons`.

  Two options, pick one:
  - **Full fix**: rewrite the static components as plain `.astro` markup (no JS
    shipped at all), keep only the 4 interactive pieces above as small islands
    (`Navbar` → `client:load`, the other 3 → `client:visible`). Biggest win,
    touches ~10 files, needs a visual QA pass + the existing Playwright/e2e specs.
  - **Smaller fix**: keep everything as React, but stop mounting it all as one
    `client:load` blob — split `Main` into per-section mounts in `index.astro` and
    hydrate each with the directive matching its need (interactive ones as above,
    static ones as `client:visible` just to defer their bytes past LCP). Lower
    effort/risk, smaller win.

## Cleanup (not a performance issue — verified negligible impact, see below)

- [ ] **Decouple `cookies` module from `privacy-policy` module.**
      `shared/policy/cookies/presentation/main.tsx:6-8` statically imports
      `PrivacyPolicyContent`/`PrivacyPolicyIntro` at module scope, so that code ships
      in the Cookies island's bundle even though it only renders when
      `consent.view === 'policy'`. Checked the actual impact: the resulting chunk is
      4.18 KiB, ~4% of total page JS, loaded in parallel with everything else — it
      does not meaningfully affect LCP or clear Lighthouse's "unused JS" threshold.
      Fix for module-boundary hygiene, not speed: replace the static import with a
      dynamic `import()` gated on opening the policy view (e.g. `React.lazy` +
      `Suspense`, or an `import()` inside `openPolicyFromBanner`/`openSettings`).
