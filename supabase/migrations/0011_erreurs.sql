-- Journal des erreurs de l'appli (plantages JavaScript sur les téléphones), avec alerte Telegram au coach.
-- Fait maison plutôt qu'un service externe : aucune donnée ne quitte Supabase (pas de sous-traitant en plus).
--
-- Ce qui est gardé : le message d'erreur, la pile d'appels, la page (sans paramètres), la version de l'appli,
-- le navigateur et le compte s'il y en a un. Jamais de données de santé. Purge automatique après 30 jours.
-- Garde-fous : textes tronqués, même erreur regroupée pendant 24 h (un compteur monte, une seule alerte),
-- 50 nouvelles erreurs par heure au plus (un robot ne peut pas remplir la table ni inonder Telegram).

create table if not exists public.client_errors (
  id bigint generated always as identity primary key,
  fingerprint text not null,
  message text not null,
  stack text,
  url text,
  release text,
  user_agent text,
  user_id uuid references auth.users (id) on delete set null,
  hits integer not null default 1,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);
create index if not exists client_errors_fingerprint on public.client_errors (fingerprint, last_seen desc);

alter table public.client_errors enable row level security;
revoke all on public.client_errors from anon, authenticated;
grant select on public.client_errors to authenticated;

drop policy if exists "erreurs : le coach lit" on public.client_errors;
create policy "erreurs : le coach lit" on public.client_errors
  for select to authenticated
  using ((select public.is_coach()));

-- Seule porte d'entrée : l'appli appelle cette fonction, personne n'écrit dans la table directement
create or replace function public.log_client_error(
  p_message text,
  p_stack text default null,
  p_url text default null,
  p_release text default null,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  msg text := left(trim(coalesce(p_message, '')), 500);
  fp text;
  recent integer;
begin
  if msg = '' then
    return;
  end if;
  -- Même message + même première ligne de pile = même erreur
  fp := md5(msg || '|' || coalesce(split_part(p_stack, E'\n', 2), ''));

  delete from public.client_errors where last_seen < now() - interval '30 days';

  update public.client_errors
    set hits = hits + 1, last_seen = now()
    where fingerprint = fp and last_seen > now() - interval '24 hours';
  if found then
    return;
  end if;

  select count(*) into recent from public.client_errors where first_seen > now() - interval '1 hour';
  if recent >= 50 then
    return;
  end if;

  insert into public.client_errors (fingerprint, message, stack, url, release, user_agent, user_id)
  values (
    fp,
    msg,
    left(p_stack, 4000),
    left(p_url, 300),
    left(p_release, 40),
    left(p_user_agent, 300),
    auth.uid()
  );

  perform public.notify_coach('Erreur dans Iko Flex (version ' || coalesce(left(p_release, 40), '?') || ') : ' || left(msg, 200));
end;
$$;
revoke all on function public.log_client_error(text, text, text, text, text) from public;
grant execute on function public.log_client_error(text, text, text, text, text) to anon, authenticated;

-- Sonde de disponibilité (.github/workflows/uptime.yml) : répond « ok » si la base répond, ne lit rien
create or replace function public.health()
returns text
language sql
stable
set search_path = ''
as $$ select 'ok'::text $$;
revoke all on function public.health() from public;
grant execute on function public.health() to anon, authenticated;
