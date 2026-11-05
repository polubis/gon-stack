Every Supabase/Postgres/Auth/Storage error goes through `fromSupabaseError`.

- Server code: `throw fromSupabaseError(error)` (`server/application/adapter/supabase`).
- Forbidden: `throw new InternalServer(error)` (also `x.error`, `itemsError`...) on a Supabase result.
- Why: one place maps codes (token rejected -> 401, FK -> 409, rate limit -> 429) and hides details; a raw `InternalServer` turns every failure into a blind 500.
- Original error stays as `cause` (log only), client gets the fixed message.
- Non-Supabase failures may use `InternalServer` with their own message, or `new Error(...)` as cause.
