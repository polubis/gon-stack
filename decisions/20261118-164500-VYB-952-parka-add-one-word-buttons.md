---
ticket: VYB-952
scope: parka/ux
summary: One-word button names rule, enforced across parka
why: Short consistent button labels; context comes from where the button sits, not from its text.
date: 2026-11-18
tags: [ux, nitpick]
---

- Added `ux-button-name` rule in `.nitpick/config.ts` (A): button names one word, `aria-label` may stay descriptive.
- Shortened ~90 button/link labels in parka (Dodaj, Zapisz, Usuń, Ponów, Wszystkie, Więcej, Zaloguj...).
- Retry unified as `Ponów`; "show all/more" and "load more" as `Wszystkie`/`Więcej`.
- Same name on one screen (several `Dodaj`) is accepted; unit tests scope queries by region/status/submit type.
- Left as is: menu items, nav links, headings and descriptive aria-labels.
