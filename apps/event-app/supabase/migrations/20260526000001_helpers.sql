-- assumption: pg_trgm is available in Supabase (enabled by default)
create extension if not exists pg_trgm;

create type public.event_category as enum (
  'Concert', 'Festival', 'Sports', 'Culture', 'Theatre', 'Food & Drink'
);

create type public.attendance_visibility as enum ('public', 'private');

create or replace function public.set_updated_at()
returns trigger language plpgsql security definer as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- rollback: drop function public.set_updated_at(); drop type public.attendance_visibility; drop type public.event_category; drop extension pg_trgm;
