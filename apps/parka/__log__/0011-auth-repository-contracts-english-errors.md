# 0011 - auth repositories use schema contracts, single error boundary, english error copy

```json
{
  "models": ["claude-sonnet-5"],
  "status": "done"
}
```

`modules/sign-in` and `modules/sign-up` `integration/repository.ts` type the parsed
response as `Schema['out']` from `@schemas/login-user` / `@schemas/register-user`
instead of a hand-rolled `{ message?: string }` shape, narrowing the rejected
branch via `'message' in body`. Removed the local `res.json().catch(() => null)`
in both repositories — parse failures now propagate to the single top-level
`try/catch` already in each `presentation/main.tsx` submit handler. Validation,
catch-all, and repository fallback error strings switched to English; static UI
copy (titles, buttons, the sign-up confirmation-pending message) stays Polish.
Same error-copy pass applied to `modules/dashboard/presentation/load-error-fallback.tsx`
(the `ErrorBoundary` fallback) — the only Polish string left in dashboard's error
path, since `handlers/load.ts`'s fallback message was already English.

Hand-typed response shapes drift from the zod contract silently; letting `json()`
throw instead of swallowing parse failures keeps exactly one error boundary per
action instead of two. English error copy (rest of the UI stays Polish) was an
explicit ask, not a full i18n pass. Consequence: new repositories type parsed
responses off their zod `Schema['out']`, never a local interface; keep exactly
one try/catch per user action.
