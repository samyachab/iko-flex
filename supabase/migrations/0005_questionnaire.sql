-- Questionnaire d'accueil : la personne envoie ses réponses, une fiche "à valider" est préparée pour le coach.
-- La personne n'écrit jamais sa fiche elle-même : un déclencheur la prépare, le coach la valide.
-- À coller dans Supabase > SQL Editor > New query, puis Run.

create table if not exists public.intakes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  mode text not null check (mode in ('general', 'custom')),
  answers jsonb not null default '{}'::jsonb,   -- réponses brutes (objectifs, tests, douleurs...)
  proposal jsonb not null default '{}'::jsonb,  -- fiche proposée (même format que profiles.data)
  health_consent_at timestamptz,                -- accord explicite pour les données de santé
  red_flags boolean not null default false,     -- signaux d'alerte : avis d'un pro conseillé
  submitted_at timestamptz not null default now()
);

alter table public.intakes enable row level security;

drop policy if exists "questionnaire : le sien, ou tous si coach" on public.intakes;
create policy "questionnaire : le sien, ou tous si coach" on public.intakes
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_coach()));

drop policy if exists "questionnaire : envoyer le sien" on public.intakes;
create policy "questionnaire : envoyer le sien" on public.intakes
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "questionnaire : refaire le sien" on public.intakes;
create policy "questionnaire : refaire le sien" on public.intakes
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke all on public.intakes from anon, authenticated;
grant select, insert, update on public.intakes to authenticated;

-- Réponses sur-mesure -> fiche "à valider" pour le coach (une fiche déjà validée n'est jamais écrasée)
create or replace function public.intake_to_draft()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.mode = 'custom' then
    update public.profiles
    set status = 'draft', data = new.proposal
    where id = new.user_id and status <> 'active';
  end if;
  return new;
end;
$$;
revoke all on function public.intake_to_draft() from public, anon, authenticated;

drop trigger if exists intake_submitted on public.intakes;
create trigger intake_submitted
  after insert or update on public.intakes
  for each row execute function public.intake_to_draft();

-- Espace coach : on ajoute le questionnaire à la liste (le type de retour change : on recrée la fonction)
drop function if exists public.coach_overview();
create function public.coach_overview()
returns table (
  id uuid,
  email text,
  name text,
  status text,
  data jsonb,
  joined_at timestamptz,
  last_session date,
  sessions_count bigint,
  intake jsonb
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
           max(s.done_on), count(s.id),
           (select to_jsonb(i) - 'user_id' from public.intakes i where i.user_id = p.id)
    from public.profiles p
    join auth.users u on u.id = p.id
    left join public.sessions s on s.user_id = p.id
    group by p.id, u.email, u.created_at
    order by (p.status = 'draft') desc, max(s.done_on) desc nulls last, u.created_at desc;
end;
$$;
revoke all on function public.coach_overview() from public, anon;
grant execute on function public.coach_overview() to authenticated;
