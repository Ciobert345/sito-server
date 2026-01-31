-- Script per configurare i permessi RLS (Row Level Security) per intel_assets
-- Esegui questo script nella SQL Editor di Supabase

-- 1. Abilita RLS sulla tabella (se non già abilitato)
ALTER TABLE intel_assets ENABLE ROW LEVEL SECURITY;

-- 2. Crea policy per permettere la lettura a tutti gli utenti autenticati
-- Questa policy permette a qualsiasi utente autenticato di leggere tutti gli intel assets
CREATE POLICY "Allow authenticated users to read intel_assets"
ON intel_assets
FOR SELECT
TO authenticated
USING (true);

-- 3. (Opzionale) Se vuoi permettere anche agli admin di inserire/modificare:
-- CREATE POLICY "Allow admins to insert intel_assets"
-- ON intel_assets
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (
--     EXISTS (
--         SELECT 1 FROM profiles
--         WHERE profiles.id = auth.uid()
--         AND profiles.is_admin = true
--     )
-- );

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
WHERE tablename = 'intel_assets';

