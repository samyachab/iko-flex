-- Photo de profil, rangée dans un espace de stockage PRIVÉ (bucket "avatars").
-- Chacun gère seulement ses photos (dossier = son identifiant). On voit la photo des autres seulement si
-- les deux participent au classement ; le coach voit toutes les photos.
-- À coller dans Supabase > SQL Editor > New query, puis Run.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

alter table public.players add column if not exists photo_path text;

-- Écrire, remplacer, supprimer : seulement dans son propre dossier
drop policy if exists "photo : gérer la sienne" on storage.objects;
create policy "photo : gérer la sienne" on storage.objects
  for all to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Voir : la sienne, celles des participants au classement (si on y participe soi-même), ou toutes si coach
drop policy if exists "photo : voir celles du classement" on storage.objects;
create policy "photo : voir celles du classement" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'avatars'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select public.is_coach())
      or (
        exists (select 1 from public.players p where p.user_id::text = (storage.foldername(name))[1] and p.share)
        and exists (select 1 from public.players me where me.user_id = (select auth.uid()) and me.share)
      )
    )
  );

-- Le classement renvoie aussi le chemin de la photo (le type de retour change : on recrée la fonction)
drop function if exists public.leaderboard(date);
create function public.leaderboard(p_today date)
returns table (
  display_name text,
  avatar text,
  photo_path text,
  current_streak int,
  best_streak int,
  week_days int,
  is_me boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with me as (
    select 1 from public.players where user_id = (select auth.uid()) and share
  ),
  pl as (
    select p.user_id, p.display_name, p.avatar, p.photo_path from public.players p where p.share and exists (select 1 from me)
  ),
  days as (
    select distinct s.user_id, s.done_on
    from public.sessions s join pl on pl.user_id = s.user_id
    where s.done_on <= p_today
  ),
  grp as (
    select user_id, done_on, done_on - (row_number() over (partition by user_id order by done_on))::int as g from days
  ),
  runs as (
    select user_id, count(*)::int as len, max(done_on) as last_day from grp group by user_id, g
  ),
  agg as (
    select user_id, max(len) as best, max(case when last_day >= p_today - 1 then len else 0 end) as cur
    from runs group by user_id
  ),
  wk as (
    select user_id, count(*)::int as n from days where done_on >= date_trunc('week', p_today)::date group by user_id
  )
  select pl.display_name, pl.avatar, pl.photo_path, coalesce(a.cur, 0), coalesce(a.best, 0), coalesce(w.n, 0),
         pl.user_id = (select auth.uid())
  from pl
  left join agg a on a.user_id = pl.user_id
  left join wk w on w.user_id = pl.user_id
  order by 4 desc, 6 desc, 5 desc, 1;
$$;

revoke all on function public.leaderboard(date) from public, anon;
grant execute on function public.leaderboard(date) to authenticated;
