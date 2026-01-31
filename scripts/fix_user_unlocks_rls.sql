-- Script per configurare i permessi RLS per user_unlocks
-- Esegui questo script nella SQL Editor di Supabase

-- 1. Rimuovi le policy esistenti se ci sono (per evitare conflitti)
DROP POLICY IF EXISTS "Users can read their own unlocks" ON user_unlocks;
DROP POLICY IF EXISTS "Users can insert their own unlocks" ON user_unlocks;

-- 2. Abilita RLS sulla tabella (se non già abilitato)
ALTER TABLE user_unlocks ENABLE ROW LEVEL SECURITY;

-- 3. Policy per permettere agli utenti di leggere i propri unlock
CREATE POLICY "Users can read their own unlocks"
ON user_unlocks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Policy per permettere agli utenti di inserire i propri unlock
CREATE POLICY "Users can insert their own unlocks"
ON user_unlocks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Verifica le policy esistenti
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'user_unlocks';

