-- Knowledge module: categories (areas) group catalogs, catalogs hold topics,
-- a topic is a stack of short Markdown reels, tags label topics and progress
-- records which reels the owner finished. Every row belongs to one owner (RLS);
-- cross-table references are composite (user_id, id) so a row can never point
-- at another owner's data. Order inside a parent is `position`, then creation.

create table public.knowledge_categories (
  user_id uuid not null references auth.users (id) on delete cascade,
  id uuid not null default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 40),
  color text not null default '#6366f1' check (color ~ '^#[0-9a-fA-F]{6}$'),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);
create unique index knowledge_categories_name_idx
  on public.knowledge_categories (user_id, lower(btrim(name)));

create table public.knowledge_catalogs (
  user_id uuid not null references auth.users (id) on delete cascade,
  id uuid not null default gen_random_uuid(),
  category_id uuid,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  description text not null default '' check (char_length(description) <= 500),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (user_id, id),
  -- A used category cannot be deleted (409), like in the time module.
  foreign key (user_id, category_id)
    references public.knowledge_categories (user_id, id) on delete restrict
);
create index knowledge_catalogs_category_idx
  on public.knowledge_catalogs (user_id, category_id);

create table public.knowledge_tags (
  user_id uuid not null references auth.users (id) on delete cascade,
  id uuid not null default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 30),
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);
create unique index knowledge_tags_name_idx
  on public.knowledge_tags (user_id, lower(btrim(name)));

create table public.knowledge_topics (
  user_id uuid not null references auth.users (id) on delete cascade,
  id uuid not null default gen_random_uuid(),
  catalog_id uuid not null,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  description text not null default '' check (char_length(description) <= 500),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, catalog_id)
    references public.knowledge_catalogs (user_id, id) on delete cascade
);
create index knowledge_topics_catalog_idx
  on public.knowledge_topics (user_id, catalog_id, position, created_at);

create table public.knowledge_topic_tags (
  user_id uuid not null references auth.users (id) on delete cascade,
  topic_id uuid not null,
  tag_id uuid not null,
  primary key (user_id, topic_id, tag_id),
  foreign key (user_id, topic_id)
    references public.knowledge_topics (user_id, id) on delete cascade,
  foreign key (user_id, tag_id)
    references public.knowledge_tags (user_id, id) on delete cascade
);
create index knowledge_topic_tags_tag_idx
  on public.knowledge_topic_tags (user_id, tag_id);

-- One reel = one small portion of Markdown, shown full screen.
create table public.knowledge_reels (
  user_id uuid not null references auth.users (id) on delete cascade,
  id uuid not null default gen_random_uuid(),
  topic_id uuid not null,
  body text not null check (char_length(btrim(body)) between 1 and 8000),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, topic_id)
    references public.knowledge_topics (user_id, id) on delete cascade
);
create index knowledge_reels_topic_idx
  on public.knowledge_reels (user_id, topic_id, position, created_at);

-- A row means the reel was finished; removing it marks the reel as not done.
create table public.knowledge_reel_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  reel_id uuid not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, reel_id),
  foreign key (user_id, reel_id)
    references public.knowledge_reels (user_id, id) on delete cascade
);

create function public.knowledge_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger knowledge_topics_touch
  before update on public.knowledge_topics
  for each row execute function public.knowledge_touch();
create trigger knowledge_reels_touch
  before update on public.knowledge_reels
  for each row execute function public.knowledge_touch();

-- Same owner-only policy and grants everywhere; anon gets nothing.
do $$
declare
  t text;
begin
  foreach t in array array[
    'knowledge_categories', 'knowledge_catalogs', 'knowledge_tags',
    'knowledge_topics', 'knowledge_topic_tags', 'knowledge_reels',
    'knowledge_reel_progress'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for all to authenticated
         using (user_id = (select auth.uid()))
         with check (user_id = (select auth.uid()))',
      t || '_owner', t);
    execute format('revoke all on table public.%I from public, anon, authenticated', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end;
$$;
