---
ticket: none
scope: parka/settings
summary: dark theme switch in the More tab
why: dark palette existed but was unreachable; users need a simple way to turn it on
date: 2026-10-11
tags: [settings, theme, dark-mode]
---

- Added "Ciemny motyw" switch in a "Wygląd" card on the Więcej (settings) page
  - Sets `data-theme="dark"` on the root, tokens in `index.css` do the rest
  - Choice kept in `localStorage` (`parka:theme`), light stays default
  - Inline head script in `seo.astro` applies it before paint (no flash)
- New `shared/theme` with `useDarkTheme`; unit tests for default, on/off, memory
