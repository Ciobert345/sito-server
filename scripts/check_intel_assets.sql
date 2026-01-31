-- Script per verificare gli intel assets nel database
-- Esegui questo script nella SQL Editor di Supabase per verificare se ci sono intel

-- 1. Conta tutti gli intel assets
SELECT COUNT(*) as total_intel FROM intel_assets;

-- 2. Mostra tutti gli intel assets
SELECT id, name, required_clearance, unlock_code, image_url 
FROM intel_assets 
ORDER BY required_clearance NULLS LAST, name;

-- 3. Conta gli intel per livello
SELECT 
    required_clearance,
    COUNT(*) as count
FROM intel_assets
WHERE required_clearance IS NOT NULL
GROUP BY required_clearance
ORDER BY required_clearance;

-- 4. Conta gli intel con codici di sblocco
SELECT COUNT(*) as intel_with_codes
FROM intel_assets
WHERE unlock_code IS NOT NULL;

