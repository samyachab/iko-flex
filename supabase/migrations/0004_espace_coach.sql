-- Espace coach : la liste des personnes inscrites, avec leur fiche et leur activité.
-- Réservé aux coachs (table coaches) ; pour les autres, la fonction refuse.
-- À coller dans Supabase > SQL Editor > New query, puis Run.

create or replace function public.coach_overview()
returns table (
  id uuid,
  email text,
  name text,
  status text,
  data jsonb,
  joined_at timestamptz,
  last_session date,
  sessions_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_coach() then
    raise exception 'coach only';
  end if;
  return query
    select p.id, u.email::text, p.name, p.status, p.data, u.created_at,
           max(s.done_on), count(s.id)
    from public.profiles p
    join auth.users u on u.id = p.id
    left join public.sessions s on s.user_id = p.id
    group by p.id, u.email, u.created_at
    order by max(s.done_on) desc nulls last, u.created_at desc;
end;
$$;

revoke all on function public.coach_overview() from public, anon;
grant execute on function public.coach_overview() to authenticated;
