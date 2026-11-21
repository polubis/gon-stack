-- One call = one lesson: topic + tags (missing ones created) + reels in the
-- given order. A single function is a single transaction: any failure rolls
-- the whole lesson back.

create function public.mcp_create_knowledge_lesson(
  p_token text, p_catalog_id uuid, p_title text,
  p_description text default null, p_study_day date default null,
  p_tag_names text[] default '{}', p_reels text[] default '{}')
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_topic uuid;
  v_tag uuid;
  v_name text;
  v_body text;
  v_pos integer := 0;
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
  returning id into v_topic;

  foreach v_name in array coalesce(p_tag_names, '{}') loop
    select id into v_tag from public.knowledge_tags
    where user_id = v_user and lower(btrim(name)) = lower(btrim(v_name));
    if v_tag is null then
      insert into public.knowledge_tags (user_id, name) values (v_user, v_name)
      returning id into v_tag;
    end if;
    insert into public.knowledge_topic_tags (user_id, topic_id, tag_id)
    values (v_user, v_topic, v_tag) on conflict do nothing;
    v_tag := null;
  end loop;

  foreach v_body in array coalesce(p_reels, '{}') loop
    insert into public.knowledge_reels (user_id, topic_id, body, position)
    values (v_user, v_topic, v_body, v_pos);
    v_pos := v_pos + 1;
  end loop;

  return jsonb_build_object(
    'topic', public.mcp_knowledge_topic_json(v_user, v_topic),
    'reels', coalesce((
      select jsonb_agg(public.mcp_knowledge_reel_json(v_user, r.id)
        order by r.position, r.created_at)
      from public.knowledge_reels r
      where r.user_id = v_user and r.topic_id = v_topic), '[]'::jsonb));
exception when check_violation then
  raise exception 'Invalid lesson: title, description, tag name or reel body out of range' using errcode = 'PT400';
end;
$$;
