-- Le prénom tapé à l'inscription est copié dans la fiche (le reste de la fiche reste réservé au coach).
-- À coller dans Supabase > SQL Editor > New query, puis Run.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'name'), ''))
  on conflict do nothing;
  insert into public.user_settings (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
