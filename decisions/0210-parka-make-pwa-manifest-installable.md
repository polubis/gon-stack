---
ticket: none
scope: parka
summary: PWA manifest follows best practices, leaf icon set
why: Installed app opened in browser tab; manifest lacked raster icons, start_url, scope, id
date: 2026-10-20
tags: [parka, pwa, manifest, icons]
---

- Manifest: `id`, `start_url` `/app/`, `scope` `/`, `lang`, `description`, `categories`, `display_override`, brand `theme_color`
- Leaf (lucide `Leaf`) icon: new `favicon.svg`, PNG 192/512, maskable 512, `apple-touch-icon`
- `og.svg`: leaf instead of ring
- `seo.astro`: apple-touch-icon, `theme-color`, web-app-capable metas
