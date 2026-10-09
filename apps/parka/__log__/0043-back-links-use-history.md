# 0043 - Back links go back in history

```json
{
  "status": "done"
}
```

Every "back" always jumped to a fixed page (e.g. settings tab) instead of the previous one.

- `shared/router/navigation.ts`: `onBackClick` - steps `history.back()` when the user arrived from inside the app (`__TSR_index > 0`) or from a same-origin page; otherwise the anchor follows its `href` (deep link, new tab). Ignores modified clicks.
- `ScreenHeader` back arrow and `ErrorState` back option use it. `href` stays as fallback, so links stay real links.
- `Button` now forwards `onClick` on its anchor branch.
- Test: `shared/ui/__tests__/screen-header.test.tsx`.

Decision: keep `<a href>` + click handler instead of a `<button>`.

Reason: back means back; fallback for direct entry; no a11y/test-role change.
