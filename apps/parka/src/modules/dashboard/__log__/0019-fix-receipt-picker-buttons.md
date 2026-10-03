# 0019 - fix dead "Wgraj z pliku" / "Zrób zdjęcie" buttons

```json
{
  "status": "done"
}
```

Buttons in "Nowy wydatek" did nothing: `pick` was curried (returned a handler) but `onClick={() => pick(ref)}` never called it, so `input.click()` never ran. Same in the `retry` of a rejected file.

- Fix: call `pick` inside the handler (`onClick={() => pick(ref)}`), `pick` is no longer curried; ref is not passed during render (lint `react-hooks/refs`).
- Tests: `receipt-scan-flow` now clicks the buttons and the retry (3 cases); verified they fail without the fix.

Decision: cover the picker via button clicks, not only via direct upload to the hidden input. Direct upload bypassed the buttons, which is why the bug passed `0018` tests.
