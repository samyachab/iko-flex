-- Ranger le jeton Telegram dans le coffre à secrets de Supabase (à faire une seule fois).
-- Remplis directement dans le SQL Editor de Supabase. N'enregistre jamais ce fichier rempli ailleurs.
--
-- 1. Dans Telegram, ouvre @BotFather, envoie /newbot, choisis un nom : il te donne un jeton (TOKEN).
-- 2. Ouvre ton nouveau bot et envoie-lui « salut ».
-- 3. Dans ton navigateur, ouvre https://api.telegram.org/botTOKEN/getUpdates (remplace TOKEN) :
--    repère "chat":{"id": 123456789 ...} -> c'est ton CHAT_ID.
-- 4. Remplace les deux valeurs ci-dessous, puis Run.

select vault.create_secret('TOKEN', 'telegram_bot_token');
select vault.create_secret('CHAT_ID', 'telegram_chat_id');

-- 5. Test : tu dois recevoir un message dans Telegram.
select public.notify_coach('Iko Flex est branché sur Telegram.');

-- Changer une valeur plus tard :
-- select vault.update_secret((select id from vault.secrets where name = 'telegram_bot_token'), 'NOUVEAU_TOKEN');
