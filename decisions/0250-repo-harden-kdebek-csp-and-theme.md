---
ticket: none
scope: repo
summary: Harden kdebek CSP, add dark mode, WCAG 2.2 and security.txt
why: Audit items - inline scripts and styles allowed by unsafe-inline, light-only site, no WCAG 2.2 checks, no security contact file
date: 2026-10-26
tags: [kdebek, csp, a11y, dark-mode]
---

- CSP (`apps/kdebek/astro.config.mjs`, `public/_headers`)
  - Astro `security.csp` hashes inline scripts/styles into a per-page meta CSP; `unsafe-inline` dropped from script-src and style-src
  - Meta keeps `'self'` + `static.cloudflareinsights.com` (script) and `'self'` (style); no default-src there, it would also cap frame-src
  - `_headers` CSP keeps img/font/connect/frame-src (youtube-nocookie), object/base/form/frame-ancestors; no script-src/style-src or default-src so the two policies do not intersect
  - Hero dot grid inline `style` attribute became the `dot-grid-pattern` utility, so no style-src-attr needed; JS `element.style` writes stay allowed
  - `markdown.syntaxHighlight` off: Shiki inline styles clash with CSP, no code blocks exist
  - New `csp.spec.ts` asserts zero `securitypolicyviolation` and console errors on home (consent, analytics, video click) and privacy policy
- WCAG 2.2
  - `wcag22aa` added to every axe tag list (home, privacy-policy, cookies, offer-video); no violations found
  - Focused elements get `scroll-margin-block` so the sticky header and cookie reopen trigger do not cover them
- Dark mode (`src/core/style/index.css`, only theme file)
  - `prefers-color-scheme: dark` overrides tokens; new tokens `card`, `on-primary`, `frame`, `icon` replace `bg-white`, `text-white`, `text-slate-400`, device frame `bg-secondary`
  - Light values unchanged, light visual baselines untouched
  - `prefers-contrast: more` raises ink-light/line/icon in both schemes; global `prefers-reduced-motion` kills transitions and smooth scroll
  - Meta `color-scheme` is `light dark`, `theme-color` is a media pair
  - Dark axe variants added to home, privacy-policy, cookies, offer-video specs; no dark visual baselines (doubles snapshots)
  - forced-colors not handled explicitly
- `public/.well-known/security.txt` (RFC 9116)
  - Contact biuro.masazdebek@gmail.com, Expires 2027-10-20, Preferred-Languages pl and en, Canonical URL; served as text/plain, robots allows it
