-- Iko Flex : le coffre-fort (tiroirs par personne).
-- À coller dans Supabase > SQL Editor > New query, puis Run. Peut être relancé sans casse.
--
-- Principe : tout est fermé par défaut (RLS activé, rien d'exposé à "anon").
--   profiles      : la fiche (conditions, règles du coach). La personne la LIT, seul le coach l'ÉCRIT.
--   user_settings : les réglages de la personne (durées, favoris, matériel). Elle les lit et les écrit.
--   sessions      : l'historique des séances validées. La personne ajoute et lit les siennes.
--   coaches       : qui est coach. Rempli à la main ici, jamais depuis l'appli.

-- ───────── Tables ─────────

create table if not exists public.coaches (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  -- general : routine générale · draft : formulaire rempli, à valider · active : fiche validée par le coach
  status text not null default 'general' check (status in ('general', 'draft', 'active')),
  -- même format que src/data/profiles.js : sport, posture_issues, pain_points, keys, plan, rules
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- même format que src/lib/settings.js : { souplesse, renfo, missing }
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  routine text not null check (routine in ('souplesse', 'renfo')),
  done_on date not null default current_date,
  exercises text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists sessions_user_day on public.sessions (user_id, done_on desc);

-- ───────── Verrous (RLS) ─────────

alter table public.coaches enable row level security;
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.sessions enable row level security;

-- Est-ce que la personne connectée est coach ? (security definer : lit coaches sans l'exposer)
create or replace function public.is_coach()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.coaches where user_id = (select auth.uid()))
$$;
revoke all on function public.is_coach() from public, anon;
grant execute on function public.is_coach() to authenticated;

-- coaches : aucune règle = personne ne lit ni n'écrit depuis l'appli

drop policy if exists "fiche : lire la sienne, ou toutes si coach" on public.profiles;
create policy "fiche : lire la sienne, ou toutes si coach" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_coach()));

drop policy if exists "fiche : seul le coach modifie" on public.profiles;
create policy "fiche : seul le coach modifie" on public.profiles
  for update to authenticated
  using ((select public.is_coach()))
  with check ((select public.is_coach()));

drop policy if exists "réglages : les siens uniquement" on public.user_settings;
create policy "réglages : les siens uniquement" on public.user_settings
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "séances : lire les siennes, ou toutes si coach" on public.sessions;
create policy "séances : lire les siennes, ou toutes si coach" on public.sessions
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_coach()));

drop policy if exists "séances : ajouter les siennes" on public.sessions;
create policy "séances : ajouter les siennes" on public.sessions
  for insert to authenticated
  with check (user_id = (select auth.uid()));

-- ───────── Ouverture explicite (les nouvelles tables ne sont pas exposées automatiquement) ─────────

revoke all on public.coaches, public.profiles, public.user_settings, public.sessions from anon, authenticated;
grant select, update (name, status, data, updated_at) on public.profiles to authenticated;
grant select, insert, update on public.user_settings to authenticated;
grant select, insert on public.sessions to authenticated;

-- ───────── Création automatique du tiroir à l'inscription ─────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  insert into public.user_settings (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at tenu à jour
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
drop trigger if exists user_settings_touch on public.user_settings;
create trigger user_settings_touch before update on public.user_settings
  for each row execute function public.touch_updated_at();
