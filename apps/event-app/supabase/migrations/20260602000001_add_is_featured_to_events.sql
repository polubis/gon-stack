alter table public.events add column is_featured boolean not null default false;

create index on public.events (is_featured) where is_featured = true;

-- rollback: alter table public.events drop column is_featured;
