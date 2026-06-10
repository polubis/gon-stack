-- is_room_member() and is_game_participant() are referenced inside RLS policy
-- expressions on rooms, games, game_participants, questions, question_options,
-- and game_scores.  Those policies evaluate in the session of the authenticated
-- role, so authenticated must hold EXECUTE on these helpers — otherwise every
-- SELECT/INSERT/UPDATE on those tables fails with "permission denied for function".
--
-- join_room() is the only permitted insert path into room_participants (the table
-- has no direct-insert grant for authenticated).  The backend calls it via the
-- user-JWT Supabase client, so authenticated must also be able to execute it.
--
-- upsert_game_score() is intentionally kept service_role-only: it is called by
-- the game-engine server process, never by a browser client.

grant execute on function public.is_room_member(uuid)          to authenticated;
grant execute on function public.is_game_participant(uuid)     to authenticated;
grant execute on function public.join_room(text, text)         to authenticated;
