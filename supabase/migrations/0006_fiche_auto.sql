-- Plus de validation obligatoire : le questionnaire sur-mesure active la fiche tout de suite.
-- Le coach peut toujours la modifier. Une fiche modifiée par le coach n'est plus écrasée si la personne
-- refait son questionnaire (le coach voit simplement les nouvelles réponses).
-- À coller dans Supabase > SQL Editor > New query, puis Run.

alter table public.profiles add column if not exists coach_edited_at timestamptz;
grant update (coach_edited_at) on public.profiles to authenticated;

create or replace function public.intake_to_draft()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.mode = 'custom' then
    update public.profiles
    set status = 'active', data = new.proposal
    where id = new.user_id and coach_edited_at is null;
  end if;
  return new;
end;
$$;
revoke all on function public.intake_to_draft() from public, anon, authenticated;
