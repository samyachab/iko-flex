-- Notifications Telegram pour le coach : nouvel inscrit, questionnaire rempli.
-- Le jeton du bot et l'identifiant de discussion sont rangés dans le coffre à secrets de Supabase (Vault),
-- jamais dans le code : voir supabase/telegram-secrets.example.sql.
-- Les messages ne contiennent que le prénom et le type de questionnaire, jamais de données de santé.
-- À coller dans Supabase > SQL Editor > New query, puis Run.

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_coach(message text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  token text;
  chat text;
begin
  select decrypted_secret into token from vault.decrypted_secrets where name = 'telegram_bot_token';
  select decrypted_secret into chat from vault.decrypted_secrets where name = 'telegram_chat_id';
  if token is null or chat is null then
    return; -- pas encore configuré : on ne bloque jamais une inscription
  end if;
  perform net.http_post(
    url := 'https://api.telegram.org/bot' || token || '/sendMessage',
    body := jsonb_build_object('chat_id', chat, 'text', message),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
exception when others then
  return; -- une notification ratée ne doit jamais faire échouer l'inscription
end;
$$;
revoke all on function public.notify_coach(text) from public, anon, authenticated;

-- Nouvel inscrit
create or replace function public.notify_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.notify_coach('Nouvel inscrit sur Iko Flex : ' || coalesce(new.name, 'sans prénom'));
  return new;
end;
$$;
revoke all on function public.notify_signup() from public, anon, authenticated;

drop trigger if exists profile_created_notify on public.profiles;
create trigger profile_created_notify
  after insert on public.profiles
  for each row execute function public.notify_signup();

-- Questionnaire envoyé
create or replace function public.notify_intake()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  who text;
begin
  select coalesce(name, 'Quelqu''un') into who from public.profiles where id = new.user_id;
  perform public.notify_coach(
    who || ' a rempli le questionnaire : '
    || case when new.mode = 'custom' then 'sur-mesure' else 'routine générale' end
    || case when new.red_flags then ' (signaux d''alerte cochés, à regarder)' else '' end
  );
  return new;
end;
$$;
revoke all on function public.notify_intake() from public, anon, authenticated;

drop trigger if exists intake_notify on public.intakes;
create trigger intake_notify
  after insert on public.intakes
  for each row execute function public.notify_intake();
