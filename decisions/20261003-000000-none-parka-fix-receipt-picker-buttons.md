---
ticket: none
scope: parka/dashboard
summary: Fix dead "Wgraj z pliku" / "Zrób zdjęcie" buttons
why: The picker buttons did nothing; tests uploaded to the hidden input directly and bypassed the buttons
date: 2026-10-03
---

- Buttons in "Nowy wydatek" did nothing: `pick` was curried (returned a handler) but `onClick={() => pick(ref)}` never called it, so `input.click()` never ran.
- Same in the `retry` of a rejected file.
- Fix: call `pick` inside the handler (`onClick={() => pick(ref)}`), `pick` is no longer curried; ref is not passed during render (lint `react-hooks/refs`).
- Tests: `receipt-scan-flow` now clicks the buttons and the retry (3 cases); verified they fail without the fix.
