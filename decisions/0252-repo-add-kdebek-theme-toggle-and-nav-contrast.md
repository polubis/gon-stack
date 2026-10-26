---
ticket: none
scope: repo
summary: Add kdebek theme toggle, themed logo and scroll-aware navbar
why: Dark mode followed only the system, Green On logo was navy on navy in dark, floating navbar blended with sections on scroll
date: 2026-10-26
tags: [kdebek, theme, a11y, navbar]
---

- Theme tokens (`src/core/style/index.css`)
  - Tokens use `light-dark()`; `:root[data-theme]` forces `color-scheme`, else system applies
  - Replaces the duplicated dark media block; light values unchanged
  - `theme-dark` custom variant for icon swap; new `shadow-nav` token
- Toggle (`navbar.astro`)
  - Sun/Moon `lucide-react` button, native button so Enter/Space work, aria-label states target theme
  - Choice in `localStorage.theme`; without it follows system and live system changes
  - Inline head script in `main.astro` sets `data-theme` before paint (no flash); Astro hashes it into the CSP meta
- Logo (`green-on-logo.tsx`)
  - SVG is single color `#0b2545`; img replaced by CSS mask (`logo-mask`) painted with `text-secondary`, so it flips with theme
  - No inline `style` (CSP); size via `h-18` + aspect ratio
- Navbar
  - Translucent `bg-card` + `backdrop-blur-xl`; after scroll >8px `data-scrolled` adds border, `shadow-nav`, denser bg
  - Border always present (transparent at top) so no layout jump; mobile menu panel matches
- Tests
  - `theme.spec.ts`: system default, keyboard toggle + reload persistence, scroll elevation
  - Home visual baselines regenerated (new toggle, nav tint); axe + csp specs pass
- Not done: `theme-color` meta stays media-based, ignores manual choice; privacy page has no toggle
