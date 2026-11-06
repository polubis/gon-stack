## Supabase Error Mapping

1. (A) Every Supabase/Postgres/Auth/Storage error goes through `fromSupabaseError` (`server/application/adapter/supabase`), e.g. `throw fromSupabaseError(error)`.
2. (A) Forbidden: `throw new InternalServer(error)` (also `x.error`, `itemsError`...) on a Supabase result.
3. (A) Why: one place maps codes (token rejected -> 401, FK -> 409, rate limit -> 429) and hides details; a raw `InternalServer` turns every failure into a blind 500.
4. (A) Original error stays as `cause` (log only), client gets the fixed message.
5. (A) Non-Supabase failures may use `InternalServer` with their own message, or `new Error(...)` as cause.
