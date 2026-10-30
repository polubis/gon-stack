-- The expense list is read in pages ordered by (date desc, id). The existing
-- (user_id, date desc) index cannot give that order, so every page sorted the
-- whole history of the user first; with `id` as the last key the index hands
-- rows over already in order and a page stops after its last row.
--
-- It also serves everything the old index served (same leading keys, the
-- dashboard's date range included), so the old one goes: one index to keep
-- up to date on every expense write instead of two.

create index expenses_user_date_id_idx
  on public.expenses (user_id, date desc, id);

drop index public.expenses_user_date_idx;

-- Rollback:
--   create index expenses_user_date_idx on public.expenses (user_id, date desc);
--   drop index public.expenses_user_date_id_idx;
