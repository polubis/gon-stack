---
ticket: none
scope: repo
summary: Gate YouTube embed behind click-to-load placeholder
why: Iframe hit Google/YouTube without consent (RODO/ePrivacy audit item 1)
date: 2026-10-26
tags: [privacy, consent, youtube, e2e]
---

- Offer video: no iframe, no YouTube request until visitor clicks "Załaduj film"
  - Placeholder: icon, title, IP-transfer notice, button, link to `/polityka-prywatnosci/`; copy in `home/presentation/copy.ts`
  - Click swaps in iframe (same title, lazy, allow list); box min-height pinned to placeholder height -> no layout jump
  - Placeholder grows past 16:9 box when content taller (no clipping) at 320-1920px
  - CSP `frame-src youtube-nocookie` unchanged; choice not remembered; privacy policy untouched
- E2E `offer-video.spec.ts`: zero YouTube requests + no iframe before click, iframe after, axe, uncut at 8 breakpoints; selectors added to `selectors.d.ts`; visual baselines unchanged
- Proof: `.evidences/kdebek-youtube-consent.webm` (before/after, wrapper frames at 320-1920, YouTube embed stubbed)
