-- Droit à l'effacement : la personne connectée supprime son compte depuis l'appli.
-- Supprimer l'utilisateur efface aussi, en cascade, sa fiche, ses réglages, ses séances (et son rôle de coach).
-- À coller dans Supabase > SQL Editor > New query, puis Run.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
