-- Modèle : activer la fiche personnalisée d'un ami (en attendant le tableau de bord coach).
-- 1. Ton ami crée son compte dans l'appli (il démarre en routine générale).
-- 2. Copie ce fichier, remplace l'email et la fiche, colle dans Supabase > SQL Editor, Run.
-- 3. Vérifie avec la requête du bas, puis ton ami ferme et rouvre l'appli.
-- Clés possibles : conditions et sports dans src/data/conditions.js, mécaniques dans src/data/mechanics.js.
-- Ne garde pas de copie remplie dans git : ce sont des données de santé.

update public.profiles
set status = 'active',
    data = '{
      "sport": "course",
      "posture_issues": ["hyperlordose", "psoas_raide"],
      "pain_points": [],
      "keys": ["lunge-psoas"],
      "rules": { "exclude_tags": [], "force_include": {}, "overrides": {} }
    }'::jsonb
where id = (select id from auth.users where email = 'email.de.ton.ami@exemple.fr');

-- Vérification : une ligne attendue, status = active
select p.name, p.status, p.data ->> 'sport' as sport
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'email.de.ton.ami@exemple.fr';

-- Revenir à la routine générale : status = 'general'
