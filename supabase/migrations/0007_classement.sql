-- Classement entre amis (séries façon Duolingo) et profil public (pseudo + avatar).
-- Rejoindre le classement est un choix : on y voit les autres seulement si on y apparaît soi-même.
-- Ce qui est partagé : pseudo, avatar, série en cours, record, jours actifs de la semaine. Rien d'autre.
-- À coller dans Supabase > SQL Editor > New query, puis Run.

create table if not exists public.players (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 24),
  avatar text not null default 'aurore',
  share boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.players enable row level security;

drop policy if exists "profil public : le sien" on public.players;
create policy "profil public : le sien" on public.players
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke all on public.players from anon, authenticated;
grant select, insert, update on public.players to authenticated;

-- Classement. p_today = jour local de la personne (les séances sont enregistrées en jour local).
-- Série en cours : jours consécutifs avec au moins une séance, jusqu'à aujourd'hui ou hier.
create or replace function public.leaderboard(p_today date)
returns table (
  display_name text,
  avatar text,
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
    select p.user_id, p.display_name, p.avatar from public.players p where p.share and exists (select 1 from me)
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
  select pl.display_name, pl.avatar, coalesce(a.cur, 0), coalesce(a.best, 0), coalesce(w.n, 0),
         pl.user_id = (select auth.uid())
  from pl
  left join agg a on a.user_id = pl.user_id
  left join wk w on w.user_id = pl.user_id
  order by 3 desc, 5 desc, 4 desc, 1;
$$;

revoke all on function public.leaderboard(date) from public, anon;
grant execute on function public.leaderboard(date) to authenticated;
