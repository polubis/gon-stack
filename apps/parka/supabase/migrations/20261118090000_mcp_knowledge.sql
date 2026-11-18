-- MCP parity with the knowledge module: categories, catalogs, tags, topics,
-- reels and reel progress. Same rules as the other MCP functions: each takes
-- the raw token, resolves its owner and touches only that owner's rows
-- (security definer + explicit user filter). `PT400` marks a refusal the
-- caller may read and act on. Reel pictures and clips are not uploaded over
-- MCP; deleting what holds them returns their paths so the API removes files.

-- Live refresh also covers the knowledge module.
create or replace function public.mcp_notify_change(p_token text, p_domain text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
begin
  if p_domain not in ('time', 'finance', 'knowledge') then
    raise exception 'unknown domain' using errcode = 'PT400';
  end if;
  perform realtime.send(
    jsonb_build_object('domain', p_domain),
    'changed',
    'data-changes:' || v_user::text,
    true
  );
  return true;
end;
$$;

-- The API removes reel files with the token header, like task attachments.
create policy knowledge_media_mcp_delete on storage.objects
  for delete to anon
  using (
    bucket_id = 'knowledge-media'
    and (storage.foldername(name))[1] = (select public.mcp_header_user())::text
  );

create function public.mcp_knowledge_topic_json(p_user uuid, p_id uuid)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', t.id,
    'catalogId', t.catalog_id,
    'title', t.title,
    'description', t.description,
    'position', t.position,
    'studyDay', t.study_day,
    'tagIds', coalesce((
      select jsonb_agg(tt.tag_id order by tt.tag_id)
      from public.knowledge_topic_tags tt
      where tt.user_id = t.user_id and tt.topic_id = t.id), '[]'::jsonb),
    'reelCount', (
      select count(*)::int from public.knowledge_reels r
      where r.user_id = t.user_id and r.topic_id = t.id),
    'doneCount', (
      select count(*)::int from public.knowledge_reels r
      join public.knowledge_reel_progress p
        on p.user_id = r.user_id and p.reel_id = r.id
      where r.user_id = t.user_id and r.topic_id = t.id),
    'createdAt', t.created_at,
    'updatedAt', t.updated_at
  )
  from public.knowledge_topics t
  where t.user_id = p_user and t.id = p_id;
$$;

create function public.mcp_knowledge_reel_json(p_user uuid, p_id uuid)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', r.id,
    'topicId', r.topic_id,
    'body', r.body,
    'position', r.position,
    'mediaKind', r.media_kind,
    'done', exists (
      select 1 from public.knowledge_reel_progress p
      where p.user_id = r.user_id and p.reel_id = r.id),
    'createdAt', r.created_at,
    'updatedAt', r.updated_at
  )
  from public.knowledge_reels r
  where r.user_id = p_user and r.id = p_id;
$$;

-- Categories ---------------------------------------------------------------

create function public.mcp_list_knowledge_categories(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
begin
  return jsonb_build_object('items', coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', c.id, 'name', c.name, 'color', c.color, 'position', c.position,
      'catalogCount', (
        select count(*)::int from public.knowledge_catalogs k
        where k.user_id = c.user_id and k.category_id = c.id))
      order by c.position, c.created_at)
    from public.knowledge_categories c
    where c.user_id = v_user), '[]'::jsonb));
end;
$$;

create function public.mcp_create_knowledge_category(
  p_token text, p_name text, p_color text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_row public.knowledge_categories;
begin
  insert into public.knowledge_categories (user_id, name, color, position)
  values (
    v_user, p_name, coalesce(p_color, '#6366f1'),
    coalesce((select max(position) + 1 from public.knowledge_categories
              where user_id = v_user), 0))
  returning * into v_row;
  return jsonb_build_object('id', v_row.id, 'name', v_row.name,
    'color', v_row.color, 'position', v_row.position, 'catalogCount', 0);
exception
  when unique_violation then
    raise exception 'A category with this name already exists' using errcode = 'PT400';
  when check_violation then
    raise exception 'Invalid category name or colour' using errcode = 'PT400';
end;
$$;

create function public.mcp_update_knowledge_category(
  p_token text, p_id uuid, p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_row public.knowledge_categories;
begin
  update public.knowledge_categories c set
    name = case when p_patch ? 'name' then p_patch->>'name' else c.name end,
    color = case when p_patch ? 'color' then p_patch->>'color' else c.color end,
    position = case when p_patch ? 'position' then (p_patch->>'position')::int else c.position end
  where c.user_id = v_user and c.id = p_id
  returning * into v_row;
  if not found then return null; end if;
  return jsonb_build_object('id', v_row.id, 'name', v_row.name,
    'color', v_row.color, 'position', v_row.position, 'catalogCount', (
      select count(*)::int from public.knowledge_catalogs k
      where k.user_id = v_user and k.category_id = v_row.id));
exception
  when unique_violation then
    raise exception 'A category with this name already exists' using errcode = 'PT400';
  when check_violation then
    raise exception 'Invalid category name, colour or position' using errcode = 'PT400';
end;
$$;

create function public.mcp_delete_knowledge_category(p_token text, p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
begin
  delete from public.knowledge_categories where user_id = v_user and id = p_id;
  return found;
exception when foreign_key_violation then
  raise exception 'The category still has catalogs: move or delete them first'
    using errcode = 'PT400';
end;
$$;

-- Catalogs -----------------------------------------------------------------

create function public.mcp_knowledge_catalog_json(p_user uuid, p_id uuid)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', c.id, 'categoryId', c.category_id, 'name', c.name,
    'description', c.description, 'position', c.position,
    'topicCount', (
      select count(*)::int from public.knowledge_topics t
      where t.user_id = c.user_id and t.catalog_id = c.id))
  from public.knowledge_catalogs c
  where c.user_id = p_user and c.id = p_id;
$$;

create function public.mcp_list_knowledge_catalogs(
  p_token text, p_category_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
begin
  return jsonb_build_object('items', coalesce((
    select jsonb_agg(public.mcp_knowledge_catalog_json(v_user, c.id)
      order by c.position, c.created_at)
    from public.knowledge_catalogs c
    where c.user_id = v_user
      and (p_category_id is null or c.category_id = p_category_id)),
    '[]'::jsonb));
end;
$$;

create function public.mcp_create_knowledge_catalog(
  p_token text, p_name text, p_category_id uuid default null,
  p_description text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_id uuid;
begin
  if p_category_id is not null and not exists (
    select 1 from public.knowledge_categories
    where user_id = v_user and id = p_category_id) then
    return null;
  end if;
  insert into public.knowledge_catalogs
    (user_id, category_id, name, description, position)
  values (
    v_user, p_category_id, p_name, coalesce(p_description, ''),
    coalesce((select max(position) + 1 from public.knowledge_catalogs
              where user_id = v_user), 0))
  returning id into v_id;
  return public.mcp_knowledge_catalog_json(v_user, v_id);
exception when check_violation then
  raise exception 'Invalid catalog name or description' using errcode = 'PT400';
end;
$$;

create function public.mcp_update_knowledge_catalog(
  p_token text, p_id uuid, p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_category uuid := nullif(p_patch->>'categoryId', '')::uuid;
begin
  if v_category is not null and not exists (
    select 1 from public.knowledge_categories
    where user_id = v_user and id = v_category) then
    raise exception 'Category not found' using errcode = 'PT400';
  end if;
  update public.knowledge_catalogs c set
    name = case when p_patch ? 'name' then p_patch->>'name' else c.name end,
    description = case when p_patch ? 'description' then p_patch->>'description' else c.description end,
    category_id = case when p_patch ? 'categoryId' then v_category else c.category_id end,
    position = case when p_patch ? 'position' then (p_patch->>'position')::int else c.position end
  where c.user_id = v_user and c.id = p_id;
  if not found then return null; end if;
  return public.mcp_knowledge_catalog_json(v_user, p_id);
exception when check_violation then
  raise exception 'Invalid catalog name, description or position' using errcode = 'PT400';
end;
$$;

-- Topics, reels and files go with the catalog; the paths are returned so the
-- API can remove the files. `null` = no such catalog.
create function public.mcp_delete_knowledge_catalog(p_token text, p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_paths jsonb;
begin
  select coalesce(jsonb_agg(r.media_path), '[]'::jsonb) into v_paths
  from public.knowledge_reels r
  join public.knowledge_topics t on t.user_id = r.user_id and t.id = r.topic_id
  where t.user_id = v_user and t.catalog_id = p_id and r.media_path is not null;
  delete from public.knowledge_catalogs where user_id = v_user and id = p_id;
  if not found then return null; end if;
  return jsonb_build_object('paths', v_paths);
end;
$$;

-- Tags ---------------------------------------------------------------------

create function public.mcp_list_knowledge_tags(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
begin
  return jsonb_build_object('items', coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', g.id, 'name', g.name,
      'topicCount', (
        select count(*)::int from public.knowledge_topic_tags tt
        where tt.user_id = g.user_id and tt.tag_id = g.id))
      order by lower(g.name))
    from public.knowledge_tags g
    where g.user_id = v_user), '[]'::jsonb));
end;
$$;

create function public.mcp_create_knowledge_tag(p_token text, p_name text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_row public.knowledge_tags;
begin
  insert into public.knowledge_tags (user_id, name)
  values (v_user, p_name) returning * into v_row;
  return jsonb_build_object('id', v_row.id, 'name', v_row.name, 'topicCount', 0);
exception
  when unique_violation then
    raise exception 'A tag with this name already exists' using errcode = 'PT400';
  when check_violation then
    raise exception 'Invalid tag name' using errcode = 'PT400';
end;
$$;

create function public.mcp_update_knowledge_tag(
  p_token text, p_id uuid, p_name text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_row public.knowledge_tags;
begin
  update public.knowledge_tags set name = p_name
  where user_id = v_user and id = p_id returning * into v_row;
  if not found then return null; end if;
  return jsonb_build_object('id', v_row.id, 'name', v_row.name, 'topicCount', (
    select count(*)::int from public.knowledge_topic_tags tt
    where tt.user_id = v_user and tt.tag_id = v_row.id));
exception
  when unique_violation then
    raise exception 'A tag with this name already exists' using errcode = 'PT400';
  when check_violation then
    raise exception 'Invalid tag name' using errcode = 'PT400';
end;
$$;

create function public.mcp_delete_knowledge_tag(p_token text, p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
begin
  delete from public.knowledge_tags where user_id = v_user and id = p_id;
  return found;
end;
$$;

-- Topics -------------------------------------------------------------------

-- Makes the topic carry exactly these tags; a tag the owner lacks is refused.
create function public.mcp_sync_knowledge_topic_tags(
  p_user uuid, p_topic uuid, p_tags uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from unnest(p_tags) t(id)
    where not exists (
      select 1 from public.knowledge_tags g
      where g.user_id = p_user and g.id = t.id)) then
    raise exception 'Tag not found' using errcode = 'PT400';
  end if;
  delete from public.knowledge_topic_tags
  where user_id = p_user and topic_id = p_topic and tag_id <> all (p_tags);
  insert into public.knowledge_topic_tags (user_id, topic_id, tag_id)
  select p_user, p_topic, t.id from unnest(p_tags) t(id)
  on conflict do nothing;
end;
$$;

revoke all on function public.mcp_sync_knowledge_topic_tags(uuid, uuid, uuid[]) from public, anon, authenticated;

create function public.mcp_list_knowledge_topics(
  p_token text,
  p_catalog_id uuid default null,
  p_tag_id uuid default null,
  p_q text default null,
  p_from date default null,
  p_to date default null,
  p_scope text default 'all',
  p_limit integer default 25,
  p_offset integer default 0)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_limit integer := least(greatest(coalesce(p_limit, 25), 1), 100);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_ids uuid[];
begin
  select coalesce(array_agg(x.id order by x.ord), '{}') into v_ids
  from (
    select t.id, row_number() over (order by t.study_day nulls last, t.position, t.created_at, t.id) as ord
    from public.knowledge_topics t
    where t.user_id = v_user
      and (p_catalog_id is null or t.catalog_id = p_catalog_id)
      and (p_tag_id is null or exists (
        select 1 from public.knowledge_topic_tags tt
        where tt.user_id = t.user_id and tt.topic_id = t.id and tt.tag_id = p_tag_id))
      and (p_q is null or t.title ilike '%' || p_q || '%' or t.description ilike '%' || p_q || '%')
      and (p_scope <> 'undated' or t.study_day is null)
      and (p_scope <> 'scheduled' or t.study_day is not null)
      and (p_scope = 'undated' or p_from is null or t.study_day between p_from and p_to)
  ) x;

  return jsonb_build_object(
    'items', coalesce((
      select jsonb_agg(public.mcp_knowledge_topic_json(v_user, id) order by ord)
      from unnest(v_ids[v_offset + 1 : v_offset + v_limit]) with ordinality u(id, ord)),
      '[]'::jsonb),
    'nextOffset', case when cardinality(v_ids) > v_offset + v_limit
                       then v_offset + v_limit end);
end;
$$;

create function public.mcp_get_knowledge_topic(p_token text, p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_topic jsonb := public.mcp_knowledge_topic_json(v_user, p_id);
begin
  if v_topic is null then return null; end if;
  return jsonb_build_object('topic', v_topic, 'reels', coalesce((
    select jsonb_agg(public.mcp_knowledge_reel_json(v_user, r.id)
      order by r.position, r.created_at)
    from public.knowledge_reels r
    where r.user_id = v_user and r.topic_id = p_id), '[]'::jsonb));
end;
$$;

create function public.mcp_create_knowledge_topic(
  p_token text, p_catalog_id uuid, p_title text,
  p_description text default null, p_study_day date default null,
  p_tag_ids uuid[] default '{}')
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_id uuid;
begin
  if not exists (
    select 1 from public.knowledge_catalogs
    where user_id = v_user and id = p_catalog_id) then
    return null;
  end if;
  insert into public.knowledge_topics
    (user_id, catalog_id, title, description, study_day, position)
  values (
    v_user, p_catalog_id, p_title, coalesce(p_description, ''), p_study_day,
    coalesce((select max(position) + 1 from public.knowledge_topics
              where user_id = v_user and catalog_id = p_catalog_id), 0))
  returning id into v_id;
  perform public.mcp_sync_knowledge_topic_tags(v_user, v_id, coalesce(p_tag_ids, '{}'));
  return public.mcp_knowledge_topic_json(v_user, v_id);
exception when check_violation then
  raise exception 'Invalid topic title or description' using errcode = 'PT400';
end;
$$;

create function public.mcp_update_knowledge_topic(
  p_token text, p_id uuid, p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_catalog uuid := (p_patch->>'catalogId')::uuid;
begin
  if p_patch ? 'catalogId' and not exists (
    select 1 from public.knowledge_catalogs
    where user_id = v_user and id = v_catalog) then
    raise exception 'Catalog not found' using errcode = 'PT400';
  end if;
  update public.knowledge_topics t set
    catalog_id = case when p_patch ? 'catalogId' then v_catalog else t.catalog_id end,
    title = case when p_patch ? 'title' then p_patch->>'title' else t.title end,
    description = case when p_patch ? 'description' then p_patch->>'description' else t.description end,
    study_day = case when p_patch ? 'studyDay' then (p_patch->>'studyDay')::date else t.study_day end,
    position = case when p_patch ? 'position' then (p_patch->>'position')::int else t.position end
  where t.user_id = v_user and t.id = p_id;
  if not found then return null; end if;
  if p_patch ? 'tagIds' then
    perform public.mcp_sync_knowledge_topic_tags(v_user, p_id, array(
      select jsonb_array_elements_text(p_patch->'tagIds')::uuid));
  end if;
  return public.mcp_knowledge_topic_json(v_user, p_id);
exception when check_violation then
  raise exception 'Invalid topic title, description or position' using errcode = 'PT400';
end;
$$;

create function public.mcp_delete_knowledge_topic(p_token text, p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_paths jsonb;
begin
  select coalesce(jsonb_agg(media_path), '[]'::jsonb) into v_paths
  from public.knowledge_reels
  where user_id = v_user and topic_id = p_id and media_path is not null;
  delete from public.knowledge_topics where user_id = v_user and id = p_id;
  if not found then return null; end if;
  return jsonb_build_object('paths', v_paths);
end;
$$;

-- Reels and progress -------------------------------------------------------

create function public.mcp_create_knowledge_reel(
  p_token text, p_topic_id uuid, p_body text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_id uuid;
begin
  if not exists (
    select 1 from public.knowledge_topics
    where user_id = v_user and id = p_topic_id) then
    return null;
  end if;
  insert into public.knowledge_reels (user_id, topic_id, body, position)
  values (
    v_user, p_topic_id, p_body,
    coalesce((select max(position) + 1 from public.knowledge_reels
              where user_id = v_user and topic_id = p_topic_id), 0))
  returning id into v_id;
  return public.mcp_knowledge_reel_json(v_user, v_id);
exception when check_violation then
  raise exception 'A reel needs a body of 1 to 8000 characters' using errcode = 'PT400';
end;
$$;

create function public.mcp_update_knowledge_reel(
  p_token text, p_id uuid, p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
begin
  update public.knowledge_reels r set
    body = case when p_patch ? 'body' then p_patch->>'body' else r.body end,
    position = case when p_patch ? 'position' then (p_patch->>'position')::int else r.position end
  where r.user_id = v_user and r.id = p_id;
  if not found then return null; end if;
  return public.mcp_knowledge_reel_json(v_user, p_id);
exception when check_violation then
  raise exception 'A reel needs a body of 1 to 8000 characters' using errcode = 'PT400';
end;
$$;

create function public.mcp_delete_knowledge_reel(p_token text, p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_path text;
begin
  delete from public.knowledge_reels where user_id = v_user and id = p_id
  returning coalesce(media_path, '') into v_path;
  if not found then return null; end if;
  return jsonb_build_object('paths',
    case when v_path = '' then '[]'::jsonb else jsonb_build_array(v_path) end);
end;
$$;

create function public.mcp_set_knowledge_progress(
  p_token text, p_reel_id uuid, p_done boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
begin
  if not exists (
    select 1 from public.knowledge_reels
    where user_id = v_user and id = p_reel_id) then
    return null;
  end if;
  if p_done then
    insert into public.knowledge_reel_progress (user_id, reel_id)
    values (v_user, p_reel_id) on conflict do nothing;
  else
    delete from public.knowledge_reel_progress
    where user_id = v_user and reel_id = p_reel_id;
  end if;
  return public.mcp_knowledge_reel_json(v_user, p_reel_id);
end;
$$;

-- Only functions taking the token are callable with the anonymous key; the
-- helpers taking a user id stay private.
do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure as sig, p.proargnames[1] = 'p_token' as public_api
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and p.proname like 'mcp\_%knowledge%'
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
    if f.public_api then
      execute format('grant execute on function %s to anon, authenticated', f.sig);
    end if;
  end loop;
end;
$$;
