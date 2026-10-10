# 0049 - Toast pattern: UX rule + implementation

```json
{
  "status": "done"
}
```

Rule `rules/ux.md` 11: error toasts follow `title:tech-code:description:close-option:retry-option`; success toasts stay a plain message.

- `Toast`: failures only get title, mono code, description, close (X), small retry button bottom-right; they persist until closed. Successes stay the original plain message, auto-dismissed.
- `Notice` = success `{message}` | error `{title, code, description, retry?}`; `notify(store, body)` in dashboard, categories, settings, expenses-management.
- Every failing handler passes `retry` re-emitting its trigger (optimistic rollback then re-apply).
- Error description is always the real message carried by the failure (server `message`, network error): toasts, render fallbacks, receipt scan, sign-in/up. Helper `shared/errors/error-message.ts`.
- Tests: `Toast` component, retry flow in categories, expenses failure toast.
- Verified by recorded e2e video: failure toast -> close; failure -> retry -> success toast.

Reason: toasts carried a bare message and no recovery path; unified, actionable feedback.
